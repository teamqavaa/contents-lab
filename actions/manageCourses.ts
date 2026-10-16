'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { CatalogCourse } from '@/actions/catalog';
import { COURSES_API_URL } from '@/lib/coursesApi';

// ---- Gestion des cours (instructeurs : leurs cours ; administrateurs : tous) ----
// Les droits sont vérifiés par courses-api (core/permissions.py) : le front ne fait que masquer
// les actions non autorisées.

export type CourseStatus = 'draft' | 'review' | 'published';

export interface ManagedCourse {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  status: CourseStatus;
  level: string;
  language: string;
  price: string;
  discount_price: string;
  thumbnail: string | null;
  category_details: { id: string; name: string; slug: string } | null;
  user_id: string;
  user_email: string;
  modules_count: number;
  lessons_count: number;
  total_students: number;
  created_at: string;
  updated_at: string;
}

export interface ActionResult {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
}

const MANAGE_PATH = '/dashboard/manage-courses';

async function token(): Promise<string | undefined> {
  return (await cookies()).get('access_token')?.value;
}

/** Transforme une réponse d'erreur DRF ({detail} ou {champ: [messages]}) en message lisible. */
function readErrors(data: unknown): Pick<ActionResult, 'message' | 'errors'> {
  if (!data || typeof data !== 'object') return { message: 'The request failed, please try again.' };
  const record = data as Record<string, unknown>;
  if (typeof record.detail === 'string') return { message: record.detail };

  const errors: Record<string, string> = {};
  for (const [field, value] of Object.entries(record)) {
    errors[field] = Array.isArray(value) ? String(value[0]) : String(value);
  }
  const first = Object.entries(errors)[0];
  return { message: first ? `${first[0]}: ${first[1]}` : 'Invalid data.', errors };
}

async function apiCall(path: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; data: unknown }> {
  const access = await token();
  if (!access) return { ok: false, status: 401, data: { detail: 'Your session has expired, please sign in again.' } };

  const headers: Record<string, string> = { Authorization: `Bearer ${access}` };
  if (init.body && !(init.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  try {
    const res = await fetch(`${COURSES_API_URL}${path}`, { ...init, headers, cache: 'no-store' });
    const data = res.status === 204 ? null : await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    console.error(`courses-api ${path} injoignable :`, error);
    return { ok: false, status: 503, data: { detail: 'The courses service is unreachable.' } };
  }
}

function result(response: { ok: boolean; data: unknown }, success: string): ActionResult {
  return response.ok ? { ok: true, message: success } : { ok: false, ...readErrors(response.data) };
}

// ---------------------------------------------------------------------------
// Lecture
// ---------------------------------------------------------------------------

/** GET /api/courses/manage/ : tous les cours (admin) ou ceux de l'instructeur. */
export async function getManagedCourses(filters: { status?: string; search?: string } = {}): Promise<ManagedCourse[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);
  const query = params.toString();
  const response = await apiCall(`/api/courses/manage/${query ? `?${query}` : ''}`);
  return response.ok ? (response.data as ManagedCourse[]) : [];
}

/** Cours complet (brouillons compris si l'utilisateur en a le droit) pour l'éditeur. */
export async function getEditableCourse(slug: string): Promise<CatalogCourse | null> {
  const response = await apiCall(`/api/courses/${encodeURIComponent(slug)}/`);
  return response.ok ? (response.data as CatalogCourse) : null;
}

// ---------------------------------------------------------------------------
// Cours
// ---------------------------------------------------------------------------

const COURSE_FIELDS = [
  'title', 'subtitle', 'description', 'category', 'level', 'language', 'price', 'discount_price',
  'promo_video_url', 'status',
] as const;

/**
 * Création (POST /api/courses/) ou modification (PATCH /api/courses/<slug>/) d'un cours.
 * Miniature : fichier `thumbnail_file` (multipart) sinon URL `thumbnail`.
 * Après une création, redirige vers l'éditeur pour ajouter le programme.
 */
export async function saveCourseAction(_: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const slug = String(formData.get('slug') || '');
  const file = formData.get('thumbnail_file');
  const hasFile = file instanceof File && file.size > 0;

  const values: Record<string, string> = {};
  for (const field of COURSE_FIELDS) {
    const value = formData.get(field);
    if (value !== null) values[field] = String(value).trim();
  }
  if (!values.discount_price) values.discount_price = '0';
  if (!values.status) delete values.status;
  const thumbnailUrl = String(formData.get('thumbnail') || '').trim();

  let body: BodyInit;
  if (hasFile) {
    const multipart = new FormData();
    Object.entries(values).forEach(([key, value]) => multipart.append(key, value));
    multipart.append('thumbnail', file);
    body = multipart;
  } else {
    body = JSON.stringify({ ...values, thumbnail: thumbnailUrl || null, promo_video_url: values.promo_video_url || null });
  }

  const response = await apiCall(slug ? `/api/courses/${encodeURIComponent(slug)}/` : '/api/courses/', {
    method: slug ? 'PATCH' : 'POST',
    body,
  });
  if (!response.ok) return { ok: false, ...readErrors(response.data) };

  revalidatePath(MANAGE_PATH, 'layout');
  const saved = response.data as { slug: string };
  if (!slug) redirect(`${MANAGE_PATH}/${saved.slug}?created=1`);
  if (saved.slug !== slug) redirect(`${MANAGE_PATH}/${saved.slug}`);
  return { ok: true, message: 'Course saved.' };
}

export async function deleteCourseAction(slug: string): Promise<ActionResult> {
  const response = await apiCall(`/api/courses/${encodeURIComponent(slug)}/`, { method: 'DELETE' });
  revalidatePath(MANAGE_PATH, 'layout');
  return result(response, 'Course deleted.');
}

/** Instructeur : draft <-> review (soumission). Administrateur : publier / remettre en brouillon. */
export async function setCourseStatusAction(slug: string, status: CourseStatus): Promise<ActionResult> {
  const response = await apiCall(`/api/courses/${encodeURIComponent(slug)}/status/`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
  revalidatePath(MANAGE_PATH, 'layout');
  const labels: Record<CourseStatus, string> = {
    draft: 'Course moved back to draft.',
    review: 'Course submitted for review.',
    published: 'Course published.',
  };
  return result(response, labels[status]);
}

// ---------------------------------------------------------------------------
// Programme : modules, leçons et vidéos
// ---------------------------------------------------------------------------

export interface ModuleInput {
  id?: string;
  course: string;
  title: string;
  description: string;
  order: number;
  is_published: boolean;
}

export async function saveModuleAction(input: ModuleInput): Promise<ActionResult> {
  const { id, ...payload } = input;
  const response = await apiCall(id ? `/api/modules/${id}/` : '/api/modules/', {
    method: id ? 'PATCH' : 'POST',
    body: JSON.stringify(payload),
  });
  revalidatePath(MANAGE_PATH, 'layout');
  return result(response, id ? 'Module updated.' : 'Module added.');
}

export async function deleteModuleAction(id: string): Promise<ActionResult> {
  const response = await apiCall(`/api/modules/${id}/`, { method: 'DELETE' });
  revalidatePath(MANAGE_PATH, 'layout');
  return result(response, 'Module deleted.');
}

export interface LessonInput {
  id?: string;
  module: string;
  title: string;
  description: string;
  lesson_type: string;
  duration_in_minutes: number;
  order: number;
  is_preview: boolean;
  is_published: boolean;
  /** URL de la vidéo (YouTube…) ; vide = pas de vidéo. */
  video_url: string;
  video_id?: string | null;
}

/** Enregistre la leçon puis crée / met à jour / supprime sa vidéo (/api/videos/). */
export async function saveLessonAction(input: LessonInput): Promise<ActionResult> {
  const { id, video_url: videoUrl, video_id: videoId, ...payload } = input;
  const response = await apiCall(id ? `/api/lessons/${id}/` : '/api/lessons/', {
    method: id ? 'PATCH' : 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) return { ok: false, ...readErrors(response.data) };

  const lessonId = (response.data as { id: string }).id;
  const url = videoUrl.trim();
  let video = { ok: true, data: null as unknown };
  if (url) {
    const provider = /youtu\.?be/.test(url) ? 'YOUTUBE' : /vimeo\.com/.test(url) ? 'VIMEO' : 'OTHER';
    video = await apiCall(videoId ? `/api/videos/${videoId}/` : '/api/videos/', {
      method: videoId ? 'PATCH' : 'POST',
      body: JSON.stringify({ lesson: lessonId, title: payload.title, provider, video_url: url }),
    });
  } else if (videoId) {
    video = await apiCall(`/api/videos/${videoId}/`, { method: 'DELETE' });
  }

  revalidatePath(MANAGE_PATH, 'layout');
  if (!video.ok) return { ok: false, message: `Lesson saved, but the video was rejected — ${readErrors(video.data).message}` };
  return { ok: true, message: id ? 'Lesson updated.' : 'Lesson added.' };
}

export async function deleteLessonAction(id: string): Promise<ActionResult> {
  const response = await apiCall(`/api/lessons/${id}/`, { method: 'DELETE' });
  revalidatePath(MANAGE_PATH, 'layout');
  return result(response, 'Lesson deleted.');
}

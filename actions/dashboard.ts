'use server';

import { cookies } from 'next/headers';

import { COURSES_API_URL } from '@/lib/coursesApi';

// ---- Types renvoyés par courses-api (/api/enrollments/) ----

export interface EnrollmentCourse {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string | null;
  level: string;
  language: string;
  average_rating: number;
  user_email: string;
  category: { name: string; slug: string };
}

export interface Enrollment {
  id: number;
  status: string;
  enrolled_at: string;
  last_accessed_at: string;
  progress_percentage: number;
  total_lessons: number;
  completed_lessons: number;
  total_duration_minutes: number;
  completed_lesson_ids: string[];
  last_lesson: { id: string; slug: string | null; title: string; position_seconds: number } | null;
  course: EnrollmentCourse;
}

export interface LearningStats {
  enrolled_courses: number;
  completed_courses: number;
  in_progress_courses: number;
  completed_lessons: number;
  learning_minutes: number;
  average_progress: number;
  activity: { date: string; lessons_completed: number; minutes: number }[];
}

async function authHeaders(): Promise<Record<string, string> | null> {
  const token = (await cookies()).get('access_token')?.value;
  if (!token) return null;
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function getJson<T>(path: string): Promise<T | null> {
  const headers = await authHeaders();
  if (!headers) return null;
  try {
    const res = await fetch(`${COURSES_API_URL}${path}`, { headers, cache: 'no-store' });
    if (!res.ok) {
      // 404 = pas d'inscription à ce cours : cas normal, pas une erreur
      if (res.status !== 404) console.error(`courses-api ${path} :`, res.status);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`courses-api ${path} injoignable :`, error);
    return null;
  }
}

/** Cours auxquels l'utilisateur connecté est inscrit, du plus récemment consulté au plus ancien. */
export async function getMyEnrollments(): Promise<Enrollment[]> {
  return (await getJson<Enrollment[]>('/api/enrollments/')) ?? [];
}

/** Inscription (et progression) de l'utilisateur sur un cours, null s'il n'est pas inscrit. */
export async function getEnrollment(courseSlug: string): Promise<Enrollment | null> {
  return getJson<Enrollment>(`/api/enrollments/${encodeURIComponent(courseSlug)}/`);
}

/** Statistiques du dashboard (totaux + activité quotidienne sur `days` jours). */
export async function getLearningStats(days = 7): Promise<LearningStats | null> {
  return getJson<LearningStats>(`/api/enrollments/stats/?days=${days}`);
}

/**
 * Enregistre la progression de lecture d'une leçon : position (secondes) et/ou leçon terminée.
 * Appelée par le lecteur de cours (CoursePlayerClient).
 */
export async function saveLessonProgress(
  courseSlug: string,
  lessonId: string,
  progress: { positionSeconds?: number; completed?: boolean } = {},
): Promise<Enrollment | null> {
  const headers = await authHeaders();
  if (!headers) return null;

  const body: Record<string, unknown> = { lesson_id: lessonId, completed: Boolean(progress.completed) };
  if (progress.positionSeconds !== undefined) {
    body.position_seconds = Math.max(0, Math.floor(progress.positionSeconds));
  }

  try {
    const res = await fetch(`${COURSES_API_URL}/api/enrollments/${encodeURIComponent(courseSlug)}/progress/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('Progression non enregistrée :', res.status);
      return null;
    }
    const data = await res.json();
    return data.enrollment as Enrollment;
  } catch (error) {
    console.error('Progression non enregistrée (API injoignable) :', error);
    return null;
  }
}

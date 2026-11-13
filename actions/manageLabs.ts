'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { COURSES_API_URL } from '@/lib/coursesApi';
import { apiCall, readErrors } from '@/lib/manageApi';

// ---- Gestion des labs (instructeurs : leurs labs ; admins, is_staff, is_superuser : tous) ----
// Les droits sont vérifiés par courses-api (lab/views/labs.py, core/permissions.py) :
// le front ne fait que masquer les actions non autorisées.

export type LabStatus = 'draft' | 'review' | 'published';

export interface ManagedLabStep {
  id: string;
  order: number;
  title: string;
  content: string;
  hint: string | null;
  starter_code: string;
}

export interface ManagedLab {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  language: 'python' | 'php' | 'typescript';
  status: LabStatus;
  difficulty: 'guided' | 'intermediate' | 'advanced';
  skills: string[];
  skill_slugs: string[];
  user_id: string;
  user_email?: string;
  author_name: string;
  starter_code: string;
  objectives: ManagedLabStep[];
  objectives_count?: number;
  created_at: string;
  updated_at: string;
}

export interface SkillOption {
  id: string;
  title: string;
  slug: string;
}

export interface LabStepInput {
  id?: string;
  title: string;
  content: string;
  hint: string;
  starter_code: string;
}

export interface LabInput {
  /** Slug du lab modifié ; absent = création. */
  slug?: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  status: string;
  starter_code: string;
  skills: string[];
  objectives: LabStepInput[];
}

export interface LabActionResult {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
  /** Lab enregistré (saveLabAction) : le formulaire reprend les id des nouvelles étapes. */
  lab?: ManagedLab;
}

const MANAGE_PATH = '/dashboard/manage-labs';

function refresh() {
  revalidatePath(MANAGE_PATH, 'layout');
  revalidatePath('/dashboard/labs');
}

// ---------------------------------------------------------------------------
// Lecture
// ---------------------------------------------------------------------------

/** GET /api/labs/manage/ : tous les labs (admin) ou ceux de l'instructeur. */
export async function getManagedLabs(filters: { status?: string; search?: string } = {}): Promise<ManagedLab[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);
  const query = params.toString();
  const response = await apiCall(`/api/labs/manage/${query ? `?${query}` : ''}`);
  return response.ok ? (response.data as ManagedLab[]) : [];
}

/** Lab complet (brouillon compris pour son auteur et les admins) pour l'éditeur. */
export async function getEditableLab(slug: string): Promise<ManagedLab | null> {
  const response = await apiCall(`/api/labs/${encodeURIComponent(slug)}/`);
  return response.ok ? (response.data as ManagedLab) : null;
}

/** Compétences actives (GET /api/skills/, public) pour rattacher un lab. */
export async function getSkillOptions(): Promise<SkillOption[]> {
  try {
    const res = await fetch(`${COURSES_API_URL}/api/skills/`, { cache: 'no-store' });
    if (!res.ok) return [];
    return ((await res.json()) as SkillOption[]).map(({ id, title, slug }) => ({ id, title, slug }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Écriture
// ---------------------------------------------------------------------------

/**
 * Création (POST /api/labs/) ou modification (PATCH /api/labs/<slug>/) d'un lab et de ses étapes.
 * Après une création, redirige vers l'éditeur.
 */
export async function saveLabAction(input: LabInput): Promise<LabActionResult> {
  const { slug, ...values } = input;
  const body = {
    ...values,
    title: values.title.trim(),
    description: values.description.trim(),
    status: values.status || undefined,
    objectives: values.objectives.map((step, index) => ({
      ...(step.id ? { id: step.id } : {}),
      order: index + 1,
      title: step.title.trim(),
      content: step.content.trim(),
      hint: step.hint.trim() || null,
      starter_code: step.starter_code,
    })),
  };

  const response = await apiCall(slug ? `/api/labs/${encodeURIComponent(slug)}/` : '/api/labs/', {
    method: slug ? 'PATCH' : 'POST',
    body: JSON.stringify(body),
  });
  if (!response.ok) return { ok: false, ...readErrors(response.data) };

  refresh();
  const saved = response.data as ManagedLab;
  if (!slug) redirect(`${MANAGE_PATH}/${saved.slug}?created=1`);
  return { ok: true, message: 'Lab saved.', lab: saved };
}

export async function deleteLabAction(slug: string): Promise<LabActionResult> {
  const response = await apiCall(`/api/labs/${encodeURIComponent(slug)}/`, { method: 'DELETE' });
  refresh();
  return response.ok ? { ok: true, message: 'Lab deleted.' } : { ok: false, ...readErrors(response.data) };
}

/** Instructeur : draft <-> review (soumission). Admin : publier / remettre en brouillon. */
export async function setLabStatusAction(slug: string, status: LabStatus): Promise<LabActionResult> {
  const response = await apiCall(`/api/labs/${encodeURIComponent(slug)}/status/`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
  refresh();
  const labels: Record<LabStatus, string> = {
    draft: 'Lab moved back to draft.',
    review: 'Lab submitted for review.',
    published: 'Lab published.',
  };
  return response.ok ? { ok: true, message: labels[status] } : { ok: false, ...readErrors(response.data) };
}

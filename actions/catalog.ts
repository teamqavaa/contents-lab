'use server';

import { COURSES_API_URL } from '@/lib/coursesApi';

// ---- Catalogue public de courses-api (uniquement les cours publiés) ----

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  parent?: string | null;
  subcategories?: CatalogCategory[];
}

export interface CatalogLesson {
  id: string;
  title: string;
  slug: string | null;
  description: string;
  lesson_type: string;
  duration_in_minutes: number;
  order: number;
  is_preview: boolean;
  is_published: boolean;
  video: { id: string; title: string; provider: string; video_url: string } | null;
}

export interface CatalogModule {
  id: string;
  title: string;
  description: string;
  order: number;
  is_published: boolean;
  lessons: CatalogLesson[];
}

export interface CatalogCourse {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  language: string;
  level: string;
  status: string;
  price: string;
  discount_price: string;
  thumbnail: string | null;
  promo_video_url: string | null;
  average_rating: number;
  total_students: number;
  user_id: string;
  /** Présent seulement pour le propriétaire du cours et les administrateurs */
  user_email?: string;
  instructor_name: string;
  prerequisites: string;
  target_audience: string;
  category_details: CatalogCategory | null;
  modules: CatalogModule[];
  created_at: string;
  updated_at: string;
}

async function fetchJson<T>(path: string, headers: Record<string, string> = {}): Promise<T | null> {
  try {
    const res = await fetch(`${COURSES_API_URL}${path}`, { headers, cache: 'no-store' });
    if (!res.ok) {
      console.error(`courses-api ${path} :`, res.status);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`courses-api ${path} injoignable :`, error);
    return null;
  }
}

/** Cours publiés, du plus récent au plus ancien (requête anonyme : jamais de brouillon). */
export async function getPublishedCourses(): Promise<CatalogCourse[]> {
  return (await fetchJson<CatalogCourse[]>('/api/courses/')) ?? [];
}

/** Détail public d'un cours publié (modules, leçons), null s'il n'existe pas ou n'est pas publié. */
export async function getPublishedCourse(slug: string): Promise<CatalogCourse | null> {
  return fetchJson<CatalogCourse>(`/api/courses/${encodeURIComponent(slug)}/`);
}

/** Catégories racines et leurs sous-catégories. */
export async function getCategories(): Promise<CatalogCategory[]> {
  return (await fetchJson<CatalogCategory[]>('/api/categories/')) ?? [];
}

export interface CourseSearchResult {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  level: string;
  language: string;
  thumbnail: string | null;
  instructor_name: string;
  category_details: CatalogCategory | null;
  average_rating: number;
  total_students: number;
  lessons_count: number;
}

export interface CourseSearchResponse {
  query: string;
  count: number;
  results: CourseSearchResult[];
}

/**
 * Recherche dans les cours publiés (GET /api/courses/search/?q=) : titre, sous-titre, description,
 * formateur, catégorie, tags, modules et leçons. Moins de 2 caractères : aucun résultat.
 */
export async function searchCourses(query: string, limit = 20): Promise<CourseSearchResponse> {
  const q = query.trim();
  const empty = { query: q, count: 0, results: [] };
  if (q.length < 2) return empty;
  const params = new URLSearchParams({ q, limit: String(limit) });
  return (await fetchJson<CourseSearchResponse>(`/api/courses/search/?${params}`)) ?? empty;
}

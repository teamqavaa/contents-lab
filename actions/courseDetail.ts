'use server';

import { cookies } from 'next/headers';

import type { CatalogCourse } from './catalog';
import { COURSES_API_URL } from '@/lib/coursesApi';

// ---- Page détail d'un cours (/courses/[slug]) : GET /api/courses/<slug>/ de courses-api ----

export interface CourseHighlight {
  id: string;
  title: string;
  description?: string;
}

export interface CourseOutcome {
  id: string;
  description: string;
  category_display?: string;
}

export interface CourseResource {
  id: string;
  title: string;
  resource_type: string;
  file?: string | null;
  external_url?: string;
  file_size_formatted?: string;
}

export interface CourseTag {
  id: string;
  name: string;
  slug: string;
}

export interface CourseDetails extends CatalogCourse {
  tags_details: CourseTag[];
  highlights: CourseHighlight[];
  learning_points: CourseHighlight[];
  outcomes: CourseOutcome[];
  resources: CourseResource[];
  total_reviews: number;
  is_enrolled: boolean;
}

/**
 * Détail d'un cours. Avec le token de l'utilisateur : `is_enrolled` est renseigné et
 * l'instructeur propriétaire (ou un admin) voit aussi son cours non publié.
 * Aucune valeur par défaut inventée : un champ vide reste vide et la page le masque.
 */
export async function getCourseDetails(slug: string): Promise<CourseDetails | null> {
  const token = (await cookies()).get('access_token')?.value;
  try {
    const res = await fetch(`${COURSES_API_URL}/api/courses/${encodeURIComponent(slug)}/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status !== 404) console.error(`courses-api /api/courses/${slug}/ :`, res.status);
      return null;
    }
    const data = await res.json();
    return {
      ...data,
      tags_details: data.tags_details ?? [],
      highlights: data.highlights ?? [],
      learning_points: data.learning_points ?? [],
      outcomes: data.outcomes ?? [],
      resources: data.resources ?? [],
      modules: data.modules ?? [],
      instructor_name: data.instructor_name ?? '',
      prerequisites: data.prerequisites ?? '',
      target_audience: data.target_audience ?? '',
      average_rating: Number(data.average_rating) || 0,
      total_students: Number(data.total_students) || 0,
      total_reviews: Number(data.total_reviews) || 0,
      is_enrolled: Boolean(data.is_enrolled),
    };
  } catch (error) {
    console.error('courses-api injoignable (getCourseDetails) :', error);
    return null;
  }
}

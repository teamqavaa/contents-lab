// lib/curriculum.ts — calculs sur le programme d'un cours (modules / leçons publiés)
import type { CatalogCourse, CatalogModule } from '@/actions/catalog';

export function publishedModules(course: Pick<CatalogCourse, 'modules'>): CatalogModule[] {
  return (course.modules || [])
    .filter((module) => module.is_published !== false)
    .sort((a, b) => a.order - b.order)
    .map((module) => ({
      ...module,
      lessons: (module.lessons || []).filter((l) => l.is_published !== false).sort((a, b) => a.order - b.order),
    }));
}

export function moduleMinutes(module: CatalogModule): number {
  return module.lessons.reduce((total, lesson) => total + (lesson.duration_in_minutes || 0), 0);
}

export function courseTotals(course: Pick<CatalogCourse, 'modules'>) {
  const modules = publishedModules(course);
  return {
    modules: modules.length,
    lessons: modules.reduce((total, module) => total + module.lessons.length, 0),
    minutes: modules.reduce((total, module) => total + moduleMinutes(module), 0),
  };
}

/** Type de parcours selon la durée totale (filtre « Course type » de /career-tracks). */
export const TRACK_TYPES = [
  { value: 'short', label: 'Short course', hint: '< 3 hrs', match: (m: number) => m < 180 },
  { value: 'course', label: 'Course', hint: '3-10 hrs', match: (m: number) => m >= 180 && m <= 600 },
  { value: 'professional', label: 'Professional track', hint: '10+ hrs', match: (m: number) => m > 600 },
] as const;

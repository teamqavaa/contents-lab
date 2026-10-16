import type { Course } from '@/actions/courses';
import type { Enrollment } from '@/actions/dashboard';

export function formatMinutes(mins: number): string {
  if (!mins) return 'N/A';
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  if (hours && minutes) return `${hours}h ${minutes}m`;
  return hours ? `${hours}h` : `${minutes}m`;
}

/** Inscription courses-api -> props du CourseCard de la page d'accueil. */
export function enrollmentToCourse(enrollment: Enrollment): Course {
  const { course } = enrollment;
  return {
    id: course.id,
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    image: course.thumbnail || '/career.jpg',
    duration: formatMinutes(enrollment.total_duration_minutes),
    lessonsCount: enrollment.total_lessons,
    rating: Number(course.average_rating) || 0,
    price: 0,
    level: course.level,
    slug: course.slug,
  };
}

/** Lien de reprise : page de lecture positionnée sur la dernière leçon consultée. */
export function resumeHref(enrollment: Enrollment): string {
  const base = `/course/${enrollment.course.slug}/learn`;
  const lesson = enrollment.last_lesson;
  return lesson ? `${base}#${lesson.slug || lesson.id}` : base;
}

export function progressProps(enrollment: Enrollment) {
  return {
    percentage: enrollment.progress_percentage,
    completedLessons: enrollment.completed_lessons,
    totalLessons: enrollment.total_lessons,
    href: resumeHref(enrollment),
    category: enrollment.course.category?.name,
  };
}

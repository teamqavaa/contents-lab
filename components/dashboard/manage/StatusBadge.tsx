import type { CourseStatus } from '@/actions/manageCourses';

export const STATUS_LABELS: Record<CourseStatus, string> = {
  draft: 'Draft',
  review: 'Pending review',
  published: 'Published',
};

const STYLES: Record<CourseStatus, string> = {
  draft: 'bg-neutral-100 text-neutral-700',
  review: 'bg-amber-50 text-amber-800',
  published: 'bg-emerald-50 text-emerald-700',
};

const DOTS: Record<CourseStatus, string> = {
  draft: 'bg-neutral-400',
  review: 'bg-amber-500',
  published: 'bg-emerald-500',
};

/** Statut d'un cours : pastille + libellé (jamais la couleur seule). */
export default function StatusBadge({ status }: { status: CourseStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status] ?? STYLES.draft}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOTS[status] ?? DOTS.draft}`} aria-hidden="true" />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

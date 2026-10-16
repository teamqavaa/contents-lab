import Link from 'next/link';
import { BookOpen, Code2, Palette } from 'lucide-react';

import type { Enrollment } from '@/actions/dashboard';
import { resumeHref } from './mappers';

const CHIP_STYLES = [
  { icon: Palette, className: 'bg-[#ece9fd] text-[#6d5deb]' },
  { icon: BookOpen, className: 'bg-pink-50 text-pink-500' },
  { icon: Code2, className: 'bg-sky-50 text-sky-500' },
];

/** Les 3 cours consultés le plus récemment : leçons vues / total. */
export default function CourseProgressChips({ enrollments }: { enrollments: Enrollment[] }) {
  if (!enrollments.length) return null;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="My courses progress">
      {enrollments.slice(0, 3).map((enrollment, index) => {
        const { icon: Icon, className } = CHIP_STYLES[index % CHIP_STYLES.length];
        return (
          <Link
            key={enrollment.id}
            href={resumeHref(enrollment)}
            className="flex items-center gap-3 rounded-2xl bg-white p-3 hover:shadow-sm transition-shadow"
          >
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${className}`}>
              <Icon className="w-5 h-5" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-xs text-neutral-400">
                {enrollment.completed_lessons}/{enrollment.total_lessons} watched
              </span>
              <span className="truncate text-[15px] font-semibold text-neutral-900">{enrollment.course.title}</span>
            </span>
          </Link>
        );
      })}
    </section>
  );
}

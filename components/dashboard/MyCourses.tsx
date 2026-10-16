import Link from 'next/link';

import { getMyEnrollments } from '@/actions/dashboard';
import CourseCard from '@/components/courses/CourseCard';
import { enrollmentToCourse, progressProps } from './mappers';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'not-started', label: 'Not started' },
  { value: 'completed', label: 'Completed' },
];

/** Onglet « Courses » : tous les cours inscrits, filtrables par état et par recherche. */
export default async function MyCourses({ query, status }: { query: string; status: string }) {
  const enrollments = await getMyEnrollments();
  const search = query.trim().toLowerCase();

  const visible = enrollments.filter((enrollment) => {
    const progress = enrollment.progress_percentage;
    if (status === 'completed' && progress < 100) return false;
    if (status === 'in-progress' && (progress <= 0 || progress >= 100)) return false;
    if (status === 'not-started' && progress > 0) return false;
    if (!search) return true;
    const { title, subtitle, category } = enrollment.course;
    return [title, subtitle, category?.name].some((text) => text?.toLowerCase().includes(search));
  });

  const filterHref = (value: string) => {
    const params = new URLSearchParams();
    if (value) params.set('status', value);
    if (query) params.set('q', query);
    const qs = params.toString();
    return qs ? `/dashboard/courses?${qs}` : '/dashboard/courses';
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My courses</h1>
          <p className="text-sm text-neutral-500">
            {enrollments.length} enrolled course{enrollments.length === 1 ? '' : 's'}
            {query && <> · results for “{query}”</>}
          </p>
        </div>

        <nav className="flex flex-wrap gap-2" aria-label="Filter courses">
          {FILTERS.map((filter) => {
            const active = status === filter.value;
            return (
              <Link
                key={filter.value || 'all'}
                href={filterHref(filter.value)}
                aria-current={active ? 'page' : undefined}
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  active ? 'bg-[#6d5deb] text-white' : 'bg-white text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {visible.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {visible.map((enrollment) => (
            <CourseCard key={enrollment.id} course={enrollmentToCourse(enrollment)} progress={progressProps(enrollment)} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-10 text-center">
          <p className="text-sm text-neutral-500">
            {enrollments.length ? 'No course matches your search.' : 'You are not enrolled in any course yet.'}
          </p>
          <Link href="/courses" className="mt-3 inline-block text-sm font-semibold text-[#6d5deb] hover:underline">
            Browse courses
          </Link>
        </div>
      )}
    </section>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Search } from 'lucide-react';

import { getManagedCourses } from '@/actions/manageCourses';
import { getConnectedUser } from '@/actions/user';
import CourseActions from '@/components/dashboard/manage/CourseActions';
import StatusBadge from '@/components/dashboard/manage/StatusBadge';
import { plural, timeAgo } from '@/lib/format';
import { canManageCourses, isAdmin } from '@/lib/roles';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Pending review' },
  { value: 'published', label: 'Published' },
];

/** Onglet « Manage courses » : liste des cours gérables (tous pour un admin, les siens pour un instructeur). */
export default async function ManageCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const user = await getConnectedUser();
  if (!canManageCourses(user)) redirect('/dashboard');
  const admin = isAdmin(user);

  const { status = '', q = '' } = await searchParams;
  const courses = await getManagedCourses({ status, search: q });

  const filterHref = (value: string) => {
    const params = new URLSearchParams();
    if (value) params.set('status', value);
    if (q) params.set('q', q);
    const query = params.toString();
    return `/dashboard/manage-courses${query ? `?${query}` : ''}`;
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Manage courses</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {admin
              ? 'All courses of the platform. Validate the courses submitted by instructors, publish or move them back to draft.'
              : 'Your courses. Submit a course for review when it is ready: an administrator will publish it.'}
          </p>
        </div>
        <Link
          href="/dashboard/manage-courses/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6d5deb] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5b4bd9]"
        >
          <Plus className="w-4 h-4" /> Add course
        </Link>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <nav className="flex gap-1.5 overflow-x-auto" aria-label="Filter by status">
          {FILTERS.map((filter) => (
            <Link
              key={filter.value}
              href={filterHref(filter.value)}
              aria-current={status === filter.value ? 'page' : undefined}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium ${
                status === filter.value ? 'bg-[#6d5deb] text-white' : 'bg-white text-neutral-700 border border-neutral-200'
              }`}
            >
              {filter.label}
            </Link>
          ))}
        </nav>
        <form method="get" role="search" className="relative md:w-72">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" aria-hidden="true" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by title"
            aria-label="Search courses by title"
            className="w-full rounded-full border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#6d5deb]"
          />
        </form>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-neutral-500">
          No course here yet.{' '}
          <Link href="/dashboard/manage-courses/new" className="font-semibold text-[#4f3fd6] underline">
            Create your first course
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {courses.map((course) => (
            <li
              key={course.id}
              className="flex flex-col gap-4 rounded-2xl bg-white p-4 md:flex-row md:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-[#ece9fd]">
                  {course.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element -- miniature externe ou /media de l'API
                    <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={course.status} />
                    {course.category_details && (
                      <span className="text-xs text-neutral-500">{course.category_details.name}</span>
                    )}
                  </div>
                  <Link
                    href={`/dashboard/manage-courses/${course.slug}`}
                    className="mt-1 block truncate font-semibold text-neutral-900 hover:text-[#4f3fd6]"
                  >
                    {course.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {plural(course.modules_count, 'module')} · {plural(course.lessons_count, 'lesson')} · {plural(course.total_students, 'student')}
                    {' · '}updated {timeAgo(course.updated_at)}
                    {admin && course.user_email ? ` · by ${course.user_email}` : ''}
                  </p>
                </div>
              </div>
              <CourseActions slug={course.slug} title={course.title} status={course.status} isAdmin={admin} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

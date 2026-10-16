import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { getCategories } from '@/actions/catalog';
import { getEditableCourse, type CourseStatus } from '@/actions/manageCourses';
import { getConnectedUser } from '@/actions/user';
import CourseActions from '@/components/dashboard/manage/CourseActions';
import CourseForm from '@/components/dashboard/manage/CourseForm';
import CurriculumEditor from '@/components/dashboard/manage/CurriculumEditor';
import StatusBadge from '@/components/dashboard/manage/StatusBadge';
import { flattenCategories } from '@/lib/categoryOptions';
import { canManageCourses, isAdmin } from '@/lib/roles';

/** Éditeur d'un cours : informations, statut et programme (modules / leçons / vidéos). */
export default async function EditCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const user = await getConnectedUser();
  if (!canManageCourses(user)) redirect('/dashboard');
  const admin = isAdmin(user);

  const [{ slug }, { created }] = await Promise.all([params, searchParams]);
  const [course, categories] = await Promise.all([getEditableCourse(slug), getCategories()]);
  // Un instructeur ne voit que ses cours (l'API refuse de toute façon les modifications des autres)
  if (!course || (!admin && course.user_id !== user?.id)) notFound();

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <Link href="/dashboard/manage-courses" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900">
            <ArrowLeft className="w-4 h-4" /> Manage courses
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="truncate text-2xl font-bold text-neutral-900">{course.title}</h1>
            <StatusBadge status={course.status as CourseStatus} />
          </div>
          {admin && course.user_email && <p className="mt-1 text-sm text-neutral-500">Created by {course.user_email}</p>}
        </div>
        <CourseActions
          slug={course.slug}
          title={course.title}
          status={course.status as CourseStatus}
          isAdmin={admin}
          hideEdit
          redirectAfterDelete="/dashboard/manage-courses"
        />
      </div>

      {created && (
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Course created as a draft. Add its modules and lessons below
          {admin ? ', then publish it.' : ', then submit it for review.'}
        </p>
      )}

      <CourseForm course={course} categories={flattenCategories(categories)} isAdmin={admin} />
      <CurriculumEditor courseId={course.id} modules={course.modules || []} />
    </section>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { getCategories } from '@/actions/catalog';
import { getConnectedUser } from '@/actions/user';
import CourseForm from '@/components/dashboard/manage/CourseForm';
import { flattenCategories } from '@/lib/categoryOptions';
import { canManageCourses, isAdmin } from '@/lib/roles';

/** Création d'un cours (instructeur ou administrateur). Le programme s'ajoute ensuite dans l'éditeur. */
export default async function NewCoursePage() {
  const user = await getConnectedUser();
  if (!canManageCourses(user)) redirect('/dashboard');
  const categories = flattenCategories(await getCategories());

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/manage-courses" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900">
          <ArrowLeft className="w-4 h-4" /> Manage courses
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">New course</h1>
        <p className="mt-1 text-sm text-neutral-500">Fill in the essentials, then add modules and lessons.</p>
      </div>
      <CourseForm categories={categories} isAdmin={isAdmin(user)} />
    </section>
  );
}

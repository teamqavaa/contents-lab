import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { getEditableLab, getSkillOptions } from '@/actions/manageLabs';
import { getConnectedUser } from '@/actions/user';
import LabActions from '@/components/dashboard/manage/LabActions';
import LabForm from '@/components/dashboard/manage/LabForm';
import StatusBadge from '@/components/dashboard/manage/StatusBadge';
import { canManageLabs, isAdmin } from '@/lib/roles';

/** Éditeur d'un lab : informations, étapes et statut. */
export default async function EditLabPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const user = await getConnectedUser();
  if (!canManageLabs(user)) redirect('/dashboard/labs');
  const admin = isAdmin(user);

  const [{ slug }, { created }] = await Promise.all([params, searchParams]);
  const [lab, skills] = await Promise.all([getEditableLab(slug), getSkillOptions()]);
  // Un instructeur ne gère que ses labs (l'API refuse de toute façon les modifications des autres)
  if (!lab || (!admin && lab.user_id !== user?.id)) notFound();

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <Link href="/dashboard/manage-labs" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900">
            <ArrowLeft className="w-4 h-4" /> Manage labs
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="truncate text-2xl font-bold text-neutral-900">{lab.title}</h1>
            <StatusBadge status={lab.status} />
          </div>
          {admin && (lab.user_email || lab.author_name) && (
            <p className="mt-1 text-sm text-neutral-500">Created by {lab.user_email || lab.author_name}</p>
          )}
        </div>
        <LabActions
          slug={lab.slug}
          title={lab.title}
          status={lab.status}
          isAdmin={admin}
          hideEdit
          redirectAfterDelete="/dashboard/manage-labs"
        />
      </div>

      {created && (
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Lab created as a draft. Preview it, then {admin ? 'publish it.' : 'submit it for review.'}
        </p>
      )}

      <LabForm lab={lab} skills={skills} isAdmin={admin} />
    </section>
  );
}

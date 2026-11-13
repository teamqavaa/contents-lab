import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { getSkillOptions } from '@/actions/manageLabs';
import { getConnectedUser } from '@/actions/user';
import LabForm from '@/components/dashboard/manage/LabForm';
import { canManageLabs, isAdmin } from '@/lib/roles';

/** Création d'un lab (instructeur ou admin) ; il appartient à l'utilisateur connecté. */
export default async function NewLabPage() {
  const user = await getConnectedUser();
  if (!canManageLabs(user)) redirect('/dashboard/labs');
  const skills = await getSkillOptions();

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/manage-labs" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900">
          <ArrowLeft className="w-4 h-4" /> Manage labs
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">New lab</h1>
        <p className="mt-1 text-sm text-neutral-500">Describe the lab and its steps. It is saved as a draft.</p>
      </div>
      <LabForm skills={skills} isAdmin={isAdmin(user)} />
    </section>
  );
}

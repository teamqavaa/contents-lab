import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Search } from 'lucide-react';

import { getManagedLabs } from '@/actions/manageLabs';
import { getConnectedUser } from '@/actions/user';
import LabActions from '@/components/dashboard/manage/LabActions';
import StatusBadge from '@/components/dashboard/manage/StatusBadge';
import { plural, timeAgo } from '@/lib/format';
import { canManageLabs, isAdmin } from '@/lib/roles';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Pending review' },
  { value: 'published', label: 'Published' },
];

const LANGUAGE_LABEL: Record<string, string> = { python: 'Python', php: 'PHP', typescript: 'TypeScript' };

/** Onglet « Manage labs » : tous les labs pour un admin (rôle admin, is_staff, is_superuser), les siens pour un instructeur. */
export default async function ManageLabsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const user = await getConnectedUser();
  if (!canManageLabs(user)) redirect('/dashboard/labs');
  const admin = isAdmin(user);

  const { status = '', q = '' } = await searchParams;
  const labs = await getManagedLabs({ status, search: q });

  const filterHref = (value: string) => {
    const params = new URLSearchParams();
    if (value) params.set('status', value);
    if (q) params.set('q', q);
    const query = params.toString();
    return `/dashboard/manage-labs${query ? `?${query}` : ''}`;
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Manage labs</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {admin
              ? 'All practice labs of the platform. Validate the labs submitted by instructors, publish or move them back to draft.'
              : 'Your practice labs. Submit a lab for review when it is ready: an administrator will publish it.'}
          </p>
        </div>
        <Link href="/dashboard/manage-labs/new" className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add lab
        </Link>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <nav className="flex gap-1.5 overflow-x-auto" aria-label="Filter by status">
          {FILTERS.map((filter) => (
            <Link
              key={filter.value}
              href={filterHref(filter.value)}
              aria-current={status === filter.value ? 'page' : undefined}
              className={`btn btn-sm ${status === filter.value ? 'btn-primary' : 'btn-secondary'}`}
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
            aria-label="Search labs by title"
            className="w-full rounded-full border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#6d5deb]"
          />
        </form>
      </div>

      {labs.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-neutral-500">
          No lab here yet.{' '}
          <Link href="/dashboard/manage-labs/new" className="font-semibold text-[#4f3fd6] underline">
            Create your first lab
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {labs.map((lab) => (
            <li key={lab.id} className="flex flex-col gap-4 rounded-2xl bg-white p-4 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={lab.status} />
                  <span className="text-xs text-neutral-500">
                    {LANGUAGE_LABEL[lab.language] ?? lab.language} · {lab.difficulty}
                  </span>
                </div>
                <Link
                  href={`/dashboard/manage-labs/${lab.slug}`}
                  className="mt-1 block truncate font-semibold text-neutral-900 hover:text-[#4f3fd6]"
                >
                  {lab.title}
                </Link>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {plural(lab.objectives_count ?? lab.objectives.length, 'step')}
                  {' · '}updated {timeAgo(lab.updated_at)}
                  {admin ? ` · by ${lab.user_email || lab.author_name || 'catalog import'}` : ''}
                </p>
              </div>
              <LabActions slug={lab.slug} title={lab.title} status={lab.status} isAdmin={admin} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

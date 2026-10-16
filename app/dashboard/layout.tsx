import type { Metadata } from 'next';

import { getMyProfile } from '@/actions/settings';
import { getConnectedUser } from '@/actions/user';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import { canManageCourses } from '@/lib/roles';

export const metadata: Metadata = {
  title: 'Dashboard · Ignite',
};

/**
 * Coque du dashboard : sidebar (Dashboard, Courses, [Manage courses], Setting, Logout) + en-tête.
 * « Manage courses » n'apparaît que pour les instructeurs et les administrateurs.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, profile] = await Promise.all([getConnectedUser(), getMyProfile()]);
  const canManage = canManageCourses(user);

  return (
    <div className="flex min-h-screen w-full bg-[#f5f5fa]">
      <Sidebar canManage={canManage} />
      <main className="flex min-w-0 flex-1 flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        <Topbar name={user?.name} email={user?.email} avatarUrl={profile?.avatar} canManage={canManage} />
        {children}
      </main>
    </div>
  );
}

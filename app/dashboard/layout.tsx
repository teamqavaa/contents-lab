import type { Metadata } from 'next';

import { getMyProfile } from '@/actions/settings';
import { getConnectedUser } from '@/actions/user';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';

export const metadata: Metadata = {
  title: 'Dashboard · Ignite',
};

/** Coque du dashboard : sidebar (Dashboard, Courses, Setting, Logout) + en-tête utilisateur. */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, profile] = await Promise.all([getConnectedUser(), getMyProfile()]);

  return (
    <div className="flex min-h-screen w-full bg-[#f5f5fa]">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        <Topbar name={user?.name} email={user?.email} avatarUrl={profile?.avatar} />
        {children}
      </main>
    </div>
  );
}

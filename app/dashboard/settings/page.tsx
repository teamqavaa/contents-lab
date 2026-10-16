import type { Metadata } from 'next';

import { getMyProfile } from '@/actions/settings';
import { getConnectedUser } from '@/actions/user';
import SettingsForms from '@/components/dashboard/SettingsForms';

export const metadata: Metadata = {
  title: 'Settings · Ignite',
};

export default async function DashboardSettingsPage() {
  const [user, profile] = await Promise.all([getConnectedUser(), getMyProfile()]);

  if (!user) {
    return (
      <p className="rounded-3xl bg-white p-8 text-center text-sm text-neutral-500">
        Your account information is unavailable right now. Please try again later.
      </p>
    );
  }

  return <SettingsForms user={user} profile={profile} />;
}

import { getLearningStats, getMyEnrollments } from '@/actions/dashboard';
import { getMyProfile } from '@/actions/settings';
import { getConnectedUser } from '@/actions/user';
import ContinueWatching from './ContinueWatching';
import CourseProgressChips from './CourseProgressChips';
import HeroBanner from './HeroBanner';
import StatisticCard from './StatisticCard';

/** Page d'accueil du dashboard : données de courses-api (cours inscrits) et du SSO (utilisateur). */
export default async function Dashboard() {
  const [user, profile, enrollments, stats] = await Promise.all([
    getConnectedUser(),
    getMyProfile(),
    getMyEnrollments(),
    getLearningStats(7),
  ]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6">
      <div className="flex min-w-0 flex-col gap-6">
        <HeroBanner />
        <CourseProgressChips enrollments={enrollments} />
        <ContinueWatching enrollments={enrollments} />
      </div>

      <aside className="min-w-0">
        <StatisticCard name={user?.name} email={user?.email} avatarUrl={profile?.avatar} stats={stats} />
      </aside>
    </div>
  );
}

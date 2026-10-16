import type { LearningStats } from '@/actions/dashboard';
import { getFirstName } from '@/lib/initials';
import ActivityChart from './ActivityChart';
import Greeting from './Greeting';
import UserAvatar from './UserAvatar';
import { formatMinutes } from './mappers';

interface StatisticCardProps {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  stats: LearningStats | null;
}

const RING_RADIUS = 54;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/** Carte « Statistic » : progression moyenne autour de l'avatar, salutation et activité. */
export default function StatisticCard({ name, email, avatarUrl, stats }: StatisticCardProps) {
  const progress = Math.round(stats?.average_progress ?? 0);

  return (
    <section className="flex flex-col gap-5 rounded-3xl bg-white p-5">
      <h2 className="text-xl font-bold text-neutral-900">Statistic</h2>

      <div className="flex flex-col items-center text-center">
        <div className="relative h-[132px] w-[132px]">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r={RING_RADIUS} fill="none" stroke="#ece9fd" strokeWidth="4" />
            <circle
              cx="60" cy="60" r={RING_RADIUS} fill="none" stroke="#6d5deb" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={RING_LENGTH * (1 - progress / 100)}
            />
          </svg>
          <div className="absolute inset-[14px]">
            <UserAvatar name={name} email={email} avatarUrl={avatarUrl} size={104} />
          </div>
          <span
            className="absolute -top-1 right-0 rounded-full bg-[#6d5deb] px-2 py-0.5 text-[11px] font-semibold text-white"
            title="Average progress across your courses"
          >
            {progress}%
          </span>
        </div>

        <div className="mt-4">
          <Greeting firstName={getFirstName(name, email)} />
          <p className="mt-1 text-xs text-neutral-500">Continue your learning to achieve your target!</p>
        </div>
      </div>

      {stats ? (
        <>
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Courses', value: stats.enrolled_courses },
              { label: 'Completed', value: stats.completed_courses },
              { label: 'Learned', value: formatMinutes(stats.learning_minutes) },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-[#f6f6fb] px-2 py-3">
                <dt className="text-[11px] text-neutral-500">{item.label}</dt>
                <dd className="mt-0.5 text-base font-bold text-neutral-900 tabular-nums">{item.value}</dd>
              </div>
            ))}
          </dl>
          <ActivityChart activity={stats.activity} />
        </>
      ) : (
        <p className="rounded-2xl bg-[#f6f6fb] p-4 text-center text-xs text-neutral-500">
          Statistics are unavailable right now.
        </p>
      )}
    </section>
  );
}

import { LearningPathDetails } from '@/actions/careers';

interface LearningPathSidebarCardProps {
  path: LearningPathDetails;
}

export default function LearningPathSidebarCard({ path }: LearningPathSidebarCardProps) {
  const totalMinutes = path.courses.reduce(
    (sum, course) => sum + (course.duration_minutes ?? 0),
    0
  );
  const totalHours = Math.round(totalMinutes / 60);

  return (
    <div className="w-full bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 font-mono flex flex-col gap-6 shadow-xs sticky top-8 z-10">
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
          PATH DETAILS
        </span>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-neutral-50 border border-neutral-200/80 p-3 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">COURSES</span>
            <span className="text-lg font-bold text-neutral-900">{path.courses.length}</span>
          </div>
          <div className="rounded-xl bg-neutral-50 border border-neutral-200/80 p-3 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">WEEKS</span>
            <span className="text-lg font-bold text-neutral-900">{path.duration_weeks}</span>
          </div>
          <div className="rounded-xl bg-neutral-50 border border-neutral-200/80 p-3 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">HOURS</span>
            <span className="text-lg font-bold text-neutral-900">{totalHours}</span>
          </div>
          <div className="rounded-xl bg-neutral-50 border border-neutral-200/80 p-3 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">PACE</span>
            <span className="text-sm font-bold text-neutral-900">{path.pace}</span>
          </div>
        </div>
      </div>

      {path.includes_certificate && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <span className="text-2xl">🎓</span>
          <div>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Certificate</p>
            <p className="text-xs text-emerald-600">Earn a certificate upon completion</p>
          </div>
        </div>
      )}

      {path.outcomes.length > 0 && (
        <div className="flex flex-col gap-3 pt-4 border-t border-neutral-100">
          <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
            WHAT YOU&apos;LL BE ABLE TO DO
          </span>
          <ul className="space-y-2">
            {[...path.outcomes]
              .sort((a, b) => a.order - b.order)
              .map((outcome) => (
                <li key={outcome.id} className="flex items-start gap-2 text-xs text-neutral-700">
                  <span className="mt-0.5 text-emerald-500 font-bold">✓</span>
                  <span>{outcome.content}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

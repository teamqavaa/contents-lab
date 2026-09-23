import { formatDuration } from "@/lib/student/format";

export default function CurriculumSummaryBar({
  totalLessons,
  durationMinutes,
  completedCount,
  percent,
}: {
  totalLessons: number;
  durationMinutes: number;
  completedCount: number;
  percent: number;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-zinc-100 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">
          {totalLessons} lessons · {formatDuration(durationMinutes)}
        </p>
        <p className="text-sm text-muted-foreground">
          {completedCount} of {totalLessons} completed
        </p>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {Math.round(percent)}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Course progress"
        className="mt-1 h-1 w-full overflow-hidden rounded-full bg-zinc-200"
      >
        <div className="h-full rounded-full bg-zinc-900" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

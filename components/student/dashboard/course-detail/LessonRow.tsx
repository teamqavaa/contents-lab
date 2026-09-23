import Link from "next/link";
import { Check, HelpCircle, Lock, Play, PlayCircle } from "lucide-react";

import type { LessonState } from "@/lib/student/lesson-status";
import type { CurriculumLesson } from "@/types/student/course";

export default function LessonRow({
  lesson,
  state,
}: {
  lesson: CurriculumLesson;
  state: LessonState;
}) {
  const isQuiz = lesson.lesson_type === "quiz";
  const locked = state === "locked";
  const filled = state === "completed" || state === "current";
  const muted = locked || state === "upcoming";
  const labs = lesson.lab_activities ?? [];

  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Number badge; quiz lessons swap the number for a "?" glyph. */}
        <span
          aria-hidden
          className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
            filled
              ? "border-zinc-900 bg-zinc-900 text-white"
              : "border-zinc-300 bg-transparent text-muted-foreground"
          }`}
        >
          {isQuiz ? <HelpCircle size={13} strokeWidth={2} /> : lesson.order}
        </span>

        {!isQuiz && (
          <Play
            size={12}
            strokeWidth={1.5}
            className={`shrink-0 ${muted ? "text-muted-foreground" : "text-foreground"}`}
            aria-hidden
          />
        )}

        <span
          className={`min-w-0 flex-1 truncate text-sm ${
            muted ? "text-muted-foreground" : "font-medium text-foreground"
          }`}
        >
          {lesson.title}
        </span>

        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {lesson.duration_minutes > 0 ? `${lesson.duration_minutes}m` : "—"}
        </span>

        <span className="flex w-5 shrink-0 items-center justify-end" aria-label={state}>
          {state === "completed" && <Check size={16} strokeWidth={2.25} className="text-foreground" />}
          {state === "current" && <PlayCircle size={16} strokeWidth={2} className="fill-zinc-900 text-zinc-900" />}
          {locked && <Lock size={14} strokeWidth={1.75} className="text-muted-foreground" />}
        </span>
      </div>

      {/* Lab activities — shown as compact links below the lesson row */}
      {labs.length > 0 && (
        <div className="ml-10 mt-1.5 flex flex-wrap gap-1.5">
          {labs.map((lab) => (
            <Link
              key={lab.id}
              href={`/labs/${lab.lab_id}`}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                muted
                  ? "border-zinc-200 text-muted-foreground"
                  : "border-zinc-300 text-foreground hover:bg-zinc-50"
              }`}
            >
              {lab.title || "Lab"}
            </Link>
          ))}
        </div>
      )}
    </li>
  );
}

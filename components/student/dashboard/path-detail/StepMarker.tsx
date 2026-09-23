import { cn } from "@/lib/utils";

import type { StepState } from "@/lib/student/path-status";

const size = "flex size-9 items-center justify-center rounded-full border text-xs font-semibold";

const styles: Record<StepState, string> = {
  // Filled green with a check: done.
  completed: "border-green-600 bg-green-600 text-white",
  // Filled black with the step number: currently active.
  in_progress: "border-zinc-900 bg-zinc-900 text-white",
  // White with gray number: reached but untouched.
  upcoming: "border-zinc-300 bg-white text-zinc-500",
  // Muted lock: gated by an earlier step.
  locked: "border-zinc-200 bg-white text-zinc-400",
};

export function StepMarker({ state, position }: { state: StepState; position: number }) {
  return (
    <div className={cn(size, styles[state])}>
      {state === "completed" ? (
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : state === "locked" ? (
        <LockGlyph />
      ) : (
        position
      )}
    </div>
  );
}

function LockGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Lock,
  Star,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Progress } from "@/components/student/ui/progress";
import { StepMarker } from "@/components/student/dashboard/path-detail/StepMarker";
import { formatDuration } from "@/lib/student/format";
import type { DerivedStep } from "@/lib/student/path-status";
import { cn } from "@/lib/utils";

function TopAffordance({ step }: { step: DerivedStep }) {
  if (step.state === "upcoming") {
    return <ArrowRight size={16} strokeWidth={2} className="shrink-0 text-zinc-400" />;
  }

  const icons: Record<string, LucideIcon> = {
    completed: CheckCircle2,
    in_progress: BarChart3,
    locked: Lock,
  };
  const Icon = icons[step.state];
  return (
    <Icon
      size={16}
      strokeWidth={2}
      className={cn(
        "shrink-0",
        step.state === "completed" && "text-green-600",
        step.state === "in_progress" && "text-zinc-400",
        step.state === "locked" && "text-zinc-300"
      )}
    />
  );
}

export function RoadmapStep({
  step,
  courseLinkBase = "/courses",
}: {
  step: DerivedStep;
  courseLinkBase?: string;
}) {
  const { course, state, percent } = step;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            STEP {step.position}
          </span>
          {state === "completed" && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-green-800">
              Completed
            </span>
          )}
          {state === "in_progress" && (
            <span className="rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-white">
              In progress
            </span>
          )}
        </div>
        <TopAffordance step={step} />
      </div>

      <h3 className="mt-2 text-sm font-semibold leading-snug tracking-tight text-foreground">
        {course.title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {course.subtitle}
      </p>

      {state === "in_progress" && (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{percent}%</span>
          </div>
          <Progress value={percent} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {course.duration_minutes > 0 && (
          <span className="flex items-center gap-1">
            <Clock size={12} /> {formatDuration(course.duration_minutes)}
          </span>
        )}
        {course.instructor && (
          <span className="flex items-center gap-1">
            <UserRound size={12} /> {course.instructor}
          </span>
        )}
        {course.rating != null && (
          <span className="flex items-center gap-1">
            <Star size={12} className="fill-current" />
            {course.rating.toFixed(1)} ({course.review_count.toLocaleString("en-US")})
          </span>
        )}
      </div>
    </>
  );

  const cardClasses = cn(
    "min-w-0 flex-1 rounded-xl border bg-card p-5 transition-colors",
    state === "locked" ? "border-zinc-200 opacity-60" : "border-border hover:border-zinc-300",
    // Green left edge + faint tint confirm completion at a glance.
    state === "completed" && "border-l-4 border-l-green-600 bg-green-50/40 hover:border-l-green-600"
  );

  return (
    <li className="flex gap-4">
      <div className="flex w-9 shrink-0 justify-center pt-5">
        <StepMarker state={state} position={step.position} />
      </div>
      {state === "locked" ? (
        <div className={cardClasses}>{body}</div>
      ) : (
        <Link href={`${courseLinkBase}/${course.slug}`} className={cn(cardClasses, "block")}>
          {body}
        </Link>
      )}
    </li>
  );
}

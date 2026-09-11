import { cn } from "@/lib/utils";
import {
  statusTone,
  type Status,
  type StatusTone,
} from "@/lib/admin-data";

const TONE_DOT: Record<StatusTone, string> = {
  green: "bg-emerald-500",
  gray: "bg-zinc-400",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

const TONE_TEXT: Record<StatusTone, string> = {
  green: "text-emerald-600",
  gray: "text-zinc-500",
  amber: "text-amber-600",
  red: "text-red-600",
};

function formatStatus(status: Status): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusDot({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  const tone = statusTone(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs",
        TONE_TEXT[tone],
        className
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5 shrink-0 rounded-full", TONE_DOT[tone])}
      />
      {formatStatus(status)}
    </span>
  );
}
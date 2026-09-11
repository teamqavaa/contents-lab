import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type RowAction = {
  icon: LucideIcon;
  label: string;
  tone?: "default" | "destructive";
  onClick?: () => void;
};

const TONE_CLASS: Record<NonNullable<RowAction["tone"]>, string> = {
  default: "text-zinc-500 hover:bg-muted hover:text-zinc-900",
  destructive:
    "text-red-600 hover:bg-red-50",
};

export function RowActions({ actions }: { actions: RowAction[] }) {
  return (
    <div className="inline-flex items-center justify-end gap-0.5">
      {actions.map(({ icon: Icon, label, tone = "default", onClick }) => (
        <button
          key={label}
          type="button"
          title={label}
          aria-label={label}
          onClick={onClick}
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-md transition-colors",
            TONE_CLASS[tone]
          )}
        >
          <Icon size={16} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}
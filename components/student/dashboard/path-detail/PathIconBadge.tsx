import type { LucideIcon } from "lucide-react";

export function PathIconBadge({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex size-16 items-center justify-center rounded-lg border border-zinc-200 bg-white">
      <Icon size={28} strokeWidth={1.5} />
    </div>
  );
}

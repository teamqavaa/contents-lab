import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SettingsRow({
  href,
  label,
  hint,
}: {
  href: string;
  label: string;
  hint?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-between gap-3 border-b border-border px-4 py-3 transition-colors",
        "hover:bg-muted/50"
      )}
    >
      <span className="text-sm">{hint ? `${label} · ${hint}` : label}</span>
      <ChevronRight
        size={16}
        strokeWidth={1.5}
        className="shrink-0 text-zinc-400"
      />
    </Link>
  );
}

export function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="bg-zinc-100 px-4 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </span>
      </div>
      {children}
    </section>
  );
}
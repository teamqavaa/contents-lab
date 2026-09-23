import type { ReactNode } from "react";

export function SidebarCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </h2>
      <div className="mt-3 h-px bg-border" />
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function StatMiniBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold leading-tight tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

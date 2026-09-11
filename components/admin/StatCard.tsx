export function StatCard({
  label,
  value,
  meta,
}: {
  label: string;
  value: string | number;
  meta?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-white px-4 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
      {meta ? (
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {meta}
        </span>
      ) : null}
    </div>
  );
}
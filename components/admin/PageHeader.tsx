import type { ReactNode } from "react";

export function PageHeader({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
        {count !== undefined && (
          <span className="ml-1.5 font-normal text-zinc-400">
            ({count})
          </span>
        )}
      </h1>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}
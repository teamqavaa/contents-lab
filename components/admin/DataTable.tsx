"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, ChevronsUpDown, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

export type DataColumn<T> = {
  key: string;
  header: ReactNode;
  className?: string;
  sortValue?: (row: T) => string | number;
  render: (row: T) => ReactNode;
};

type SortState = { key: string; dir: "asc" | "desc" } | null;

function Checkbox({
  checked,
  indeterminate,
  label,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "grid size-4 shrink-0 place-items-center rounded-[4px] border transition-colors",
        checked || indeterminate
          ? "border-primary bg-primary text-primary-foreground"
          : "border-zinc-300 bg-white hover:border-zinc-400"
      )}
    >
      {indeterminate ? (
        <Minus size={12} strokeWidth={2} />
      ) : checked ? (
        <Check size={12} strokeWidth={2} />
      ) : null}
    </button>
  );
}

export function DataTable<T>({
  rows,
  rowKey,
  columns,
  selectable = false,
  renderRowActions,
}: {
  rows: T[];
  rowKey: (row: T) => React.Key;
  columns: DataColumn<T>[];
  selectable?: boolean;
  renderRowActions?: (row: T) => ReactNode;
}) {
  const [sort, setSort] = useState<SortState>(null);
  const [selected, setSelected] = useState<Set<React.Key>>(new Set());

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) return rows;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [rows, columns, sort]);

  const allKeys = rows.map(rowKey);
  const allSelected =
    allKeys.length > 0 && allKeys.every((k) => selected.has(k));
  const someSelected = allKeys.some((k) => selected.has(k));

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(allKeys));
  };

  const toggleRow = (key: React.Key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            {selectable && (
              <th className="w-10 py-2 pl-4 pr-2">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  label="Select all rows"
                  onChange={toggleAll}
                />
              </th>
            )}
            {columns.map((col) => {
              const isSorted = sort?.key === col.key;
              return (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap",
                    col.className
                  )}
                >
                  {col.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors",
                        isSorted
                          ? "text-foreground"
                          : "hover:text-foreground"
                      )}
                    >
                      {col.header}
                      {isSorted ? (
                        sort!.dir === "asc" ? (
                          <ArrowUp size={12} strokeWidth={2} />
                        ) : (
                          <ArrowDown size={12} strokeWidth={2} />
                        )
                      ) : (
                        <ChevronsUpDown
                          size={12}
                          strokeWidth={1.5}
                          className="text-zinc-300"
                        />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
            {renderRowActions && (
              <th className="py-3 pr-4 text-right font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => {
            const key = rowKey(row);
            const isRowSelected = selected.has(key);
            return (
              <tr
                key={key}
                className={cn(
                  "border-b border-border transition-colors last:border-b-0",
                  isRowSelected ? "bg-muted/50" : "hover:bg-muted/40"
                )}
              >
                {selectable && (
                  <td className="py-2.5 pl-4 pr-2">
                    <Checkbox
                      checked={isRowSelected}
                      label="Select row"
                      onChange={() => toggleRow(key)}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-2.5 text-sm text-foreground whitespace-nowrap",
                      col.className
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
                {renderRowActions && (
                  <td className="py-2.5 pr-4 text-right">
                    {renderRowActions(row)}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
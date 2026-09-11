"use client";

import { Pencil, Trash2 } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { InitialAvatar } from "@/components/admin/InitialAvatar";
import { RowActions, type RowAction } from "@/components/admin/RowActions";
import { StatusDot } from "@/components/admin/StatusDot";
import type { Instructor } from "@/lib/admin-data";

const standardActions: RowAction[] = [
  { icon: Pencil, label: "Edit" },
  { icon: Trash2, label: "Delete", tone: "destructive" },
];

function ApproveButtons() {
  return (
    <>
      <button
        type="button"
        className="inline-flex h-7 items-center rounded-md border border-emerald-200 px-2.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
      >
        Approve
      </button>
      <button
        type="button"
        className="inline-flex h-7 items-center rounded-md border border-red-200 px-2.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        Reject
      </button>
    </>
  );
}

const columns: DataColumn<Instructor>[] = [
  {
    key: "name",
    header: "Name",
    sortValue: (i) => i.name,
    render: (i) => (
      <div className="flex items-center gap-2.5">
        <InitialAvatar name={i.name} className="size-7 text-[10px]" />
        <span className="font-medium">{i.name}</span>
      </div>
    ),
  },
  {
    key: "email",
    header: "Email",
    sortValue: (i) => i.email,
    render: (i) => <span className="text-muted-foreground">{i.email}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (i) => <StatusDot status={i.status} />,
  },
  {
    key: "courses",
    header: "Courses",
    sortValue: (i) => i.courses,
    render: (i) => <span>{i.courses}</span>,
  },
];

export function InstructorsTable({ rows }: { rows: Instructor[] }) {
  return (
    <DataTable
      rows={rows}
      rowKey={(i) => i.id}
      columns={columns}
      renderRowActions={(i) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          {i.status === "pending" && <ApproveButtons />}
          <RowActions actions={standardActions} />
        </div>
      )}
    />
  );
}
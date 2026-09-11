"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { RowActions, type RowAction } from "@/components/admin/RowActions";
import { StatusDot } from "@/components/admin/StatusDot";
import { Badge } from "@/components/ui/badge";
import type { LearningPath } from "@/lib/admin-data";

const actions: RowAction[] = [
  { icon: Eye, label: "View" },
  { icon: Pencil, label: "Edit" },
  { icon: Trash2, label: "Delete", tone: "destructive" },
];

const columns: DataColumn<LearningPath>[] = [
  {
    key: "name",
    header: "Path Name",
    sortValue: (p) => p.name,
    render: (p) => <span className="font-medium">{p.name}</span>,
  },
  {
    key: "targetRole",
    header: "Target Role",
    sortValue: (p) => p.targetRole,
    render: (p) => <Badge variant="outline">{p.targetRole}</Badge>,
  },
  {
    key: "courses",
    header: "Courses",
    sortValue: (p) => p.courses,
    render: (p) => <span>{p.courses}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (p) => <StatusDot status={p.status} />,
  },
];

export function LearningPathsTable({ rows }: { rows: LearningPath[] }) {
  return (
    <DataTable
      rows={rows}
      rowKey={(p) => p.id}
      columns={columns}
      renderRowActions={() => <RowActions actions={actions} />}
    />
  );
}
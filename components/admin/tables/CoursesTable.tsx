"use client";

import { Ban, Eye, Pencil, Trash2 } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { RowActions, type RowAction } from "@/components/admin/RowActions";
import { StatusDot } from "@/components/admin/StatusDot";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/lib/admin-data";

const actions: RowAction[] = [
  { icon: Eye, label: "View" },
  { icon: Pencil, label: "Edit" },
  { icon: Ban, label: "Disable" },
  { icon: Trash2, label: "Delete", tone: "destructive" },
];

const columns: DataColumn<Course>[] = [
  {
    key: "title",
    header: "Title",
    sortValue: (c) => c.title,
    render: (c) => <span className="font-medium">{c.title}</span>,
  },
  {
    key: "instructor",
    header: "Instructor",
    sortValue: (c) => c.instructor,
    render: (c) => <span className="text-muted-foreground">{c.instructor}</span>,
  },
  {
    key: "category",
    header: "Category",
    sortValue: (c) => c.category,
    render: (c) => <Badge variant="outline">{c.category}</Badge>,
  },
  {
    key: "status",
    header: "Status",
    render: (c) => <StatusDot status={c.status} />,
  },
  {
    key: "enrolled",
    header: "Enrolled",
    sortValue: (c) => c.enrolled,
    render: (c) => <span>{c.enrolled.toLocaleString()}</span>,
  },
];

export function CoursesTable({ rows }: { rows: Course[] }) {
  return (
    <DataTable
      rows={rows}
      rowKey={(c) => c.id}
      columns={columns}
      renderRowActions={() => <RowActions actions={actions} />}
    />
  );
}
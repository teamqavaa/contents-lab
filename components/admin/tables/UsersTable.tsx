"use client";

import { Ban, Eye, LogIn, Pencil, Trash2 } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { InitialAvatar } from "@/components/admin/InitialAvatar";
import { RowActions, type RowAction } from "@/components/admin/RowActions";
import { StatusDot } from "@/components/admin/StatusDot";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/lib/admin-data";

const actions: RowAction[] = [
  { icon: LogIn, label: "Login as user" },
  { icon: Eye, label: "View" },
  { icon: Pencil, label: "Edit" },
  { icon: Ban, label: "Suspend" },
  { icon: Trash2, label: "Delete", tone: "destructive" },
];

const columns: DataColumn<User>[] = [
  {
    key: "name",
    header: "Name",
    sortValue: (u) => u.name,
    render: (u) => (
      <div className="flex items-center gap-2.5">
        <InitialAvatar name={u.name} className="size-7 text-[10px]" />
        <span className="font-medium">{u.name}</span>
      </div>
    ),
  },
  {
    key: "email",
    header: "Email",
    sortValue: (u) => u.email,
    render: (u) => <span className="text-muted-foreground">{u.email}</span>,
  },
  {
    key: "role",
    header: "Role",
    sortValue: (u) => u.role,
    render: (u) => <Badge variant="outline">{u.role}</Badge>,
  },
  {
    key: "status",
    header: "Status",
    render: (u) => <StatusDot status={u.status} />,
  },
  {
    key: "joined",
    header: "Joined",
    sortValue: (u) => u.joined,
    render: (u) => <span className="text-muted-foreground">{u.joined}</span>,
  },
];

export function UsersTable({ rows }: { rows: User[] }) {
  return (
    <DataTable
      rows={rows}
      rowKey={(u) => u.id}
      columns={columns}
      selectable
      renderRowActions={() => <RowActions actions={actions} />}
    />
  );
}
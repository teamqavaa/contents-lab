"use client";

import { Ban, CheckCircle2 } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { InitialAvatar } from "@/components/admin/InitialAvatar";
import { RowActions } from "@/components/admin/RowActions";
import { StatusDot } from "@/components/admin/StatusDot";
import { Badge } from "@/components/ui/badge";
import {
  toggleUserActiveAction,
  updateUserRoleAction,
} from "@/lib/admin-actions";
import type { AdminUser } from "@/lib/api/lab-api";

const ROLE_TONES: Record<string, string> = {
  admin: "bg-zinc-900 text-white",
  instructor: "bg-zinc-100 text-zinc-800",
  student: "border border-zinc-300 text-zinc-600",
  parent: "border border-zinc-300 text-zinc-600",
};

function columns(onRoleChange: (id: string, role: string) => void): DataColumn<AdminUser>[] {
  return [
    {
      key: "name",
      header: "Name",
      sortValue: (u) => u.full_name ?? "",
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <InitialAvatar name={u.full_name || u.email || "?"} className="size-7 text-[10px]" />
          <span className="font-medium">{u.display_name || u.full_name || "—"}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      sortValue: (u) => u.email ?? "",
      render: (u) => <span className="text-muted-foreground">{u.email ?? u.phone}</span>,
    },
    {
      key: "role",
      header: "Role",
      sortValue: (u) => u.role,
      render: (u) => (
        <select
          value={u.role}
          onChange={(event) => onRoleChange(u.id, event.target.value)}
          aria-label={`Role for ${u.full_name || u.email}`}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
        >
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
          <option value="parent">Parent</option>
        </select>
      ),
    },
    {
      key: "is_staff",
      header: "Staff",
      render: (u) =>
        u.is_staff ? (
          <Badge className={ROLE_TONES.admin}>Staff</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <StatusDot status={u.is_active ? "active" : "suspended"} />
      ),
    },
    {
      key: "joined",
      header: "Joined",
      sortValue: (u) => u.date_joined,
      render: (u) => (
        <span className="text-muted-foreground">
          {new Date(u.date_joined).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];
}

export function UsersManager({ users }: { users: AdminUser[] }) {
  const handleRoleChange = (id: string, role: string) => {
    updateUserRoleAction(id, role).then(() => location.reload());
  };

  return (
    <DataTable
      rows={users}
      rowKey={(u) => u.id}
      columns={columns(handleRoleChange)}
      renderRowActions={(user) => (
        <RowActions
          actions={[
            user.is_active
              ? {
                  icon: Ban,
                  label: "Deactivate",
                  tone: "destructive",
                  onClick: () =>
                    toggleUserActiveAction(user.id, false).then(() => location.reload()),
                }
              : {
                  icon: CheckCircle2,
                  label: "Activate",
                  onClick: () =>
                    toggleUserActiveAction(user.id, true).then(() => location.reload()),
                },
          ]}
        />
      )}
    />
  );
}
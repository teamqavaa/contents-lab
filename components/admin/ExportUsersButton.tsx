"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AdminUser } from "@/lib/api/lab-api";
import { stringifyCsv } from "@/lib/csv";

const COLUMNS = [
  "full_name",
  "display_name",
  "email",
  "phone",
  "role",
  "is_active",
  "is_staff",
  "date_joined",
] as const;

export function ExportUsersButton({ users }: { users: AdminUser[] }) {
  const download = () => {
    // Export never includes passwords; the file round-trips as an import.
    const rows = [
      COLUMNS,
      ...users.map((user) => [
        user.full_name ?? "",
        user.display_name ?? "",
        user.email ?? "",
        user.phone ?? "",
        user.role,
        user.is_active,
        user.is_staff,
        user.date_joined,
      ]),
    ];
    const blob = new Blob([stringifyCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button size="sm" variant="outline" onClick={download} disabled={users.length === 0}>
      <Download size={14} />
      Export CSV
    </Button>
  );
}

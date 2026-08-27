"use client";

import { useActionState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { RowActions } from "@/components/admin/RowActions";
import { StatusDot } from "@/components/admin/StatusDot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  createSkillAction,
  deleteSkillAction,
  updateSkillAction,
} from "@/lib/admin-actions";
import type { Skill } from "@/lib/api/lab-api";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

const columns: DataColumn<Skill>[] = [
  {
    key: "title",
    header: "Title",
    sortValue: (s) => s.title,
    render: (s) => <span className="font-medium">{s.title}</span>,
  },
  {
    key: "slug",
    header: "Slug",
    sortValue: (s) => s.slug,
    render: (s) => <span className="text-muted-foreground">{s.slug}</span>,
  },
  {
    key: "order",
    header: "Order",
    sortValue: (s) => s.order,
    render: (s) => <span className="tabular-nums text-muted-foreground">{s.order}</span>,
  },
  {
    key: "icon",
    header: "Icon",
    render: (s) => <Badge variant="outline">{s.icon || "—"}</Badge>,
  },
  {
    key: "is_active",
    header: "Status",
    render: (s) => (
      <StatusDot status={s.is_active ? "active" : "draft"} />
    ),
  },
];

function SkillForm() {
  const [state, formAction, pending] = useActionState(createSkillAction, { ok: false });

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-semibold">New skill</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="title" className="text-xs font-medium text-foreground">Title</label>
          <input id="title" name="title" required placeholder="Git" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="slug" className="text-xs font-medium text-foreground">Slug</label>
          <input id="slug" name="slug" placeholder="git" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="icon" className="text-xs font-medium text-foreground">Icon</label>
          <input id="icon" name="icon" placeholder="git" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="order" className="text-xs font-medium text-foreground">Order</label>
          <input id="order" name="order" type="number" min="0" defaultValue="0" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="is_active" className="text-xs font-medium text-foreground">Active</label>
          <select id="is_active" name="is_active" defaultValue="1" className={inputClass}>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="description" className="text-xs font-medium text-foreground">Description</label>
          <input id="description" name="description" placeholder="Short description" className={inputClass} />
        </div>
      </div>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        <Plus size={15} /> Create
      </Button>
    </form>
  );
}

export function SkillsManager({ skills }: { skills: Skill[] }) {
  return (
    <div className="space-y-4">
      <SkillForm />
      <DataTable
        rows={skills}
        rowKey={(s) => s.id}
        columns={columns}
        renderRowActions={(skill) => (
          <RowActions
            actions={[
              {
                icon: Pencil,
                label: "Edit order",
                onClick: () => {
                  const next = prompt(`Display order for "${skill.title}"`, String(skill.order));
                  if (next !== null && next.trim() !== "") {
                    updateSkillAction(skill.id, { order: Number(next) }).then(() =>
                      location.reload()
                    );
                  }
                },
              },
              {
                icon: Pencil,
                label: skill.is_active ? "Deactivate" : "Activate",
                onClick: () =>
                  updateSkillAction(skill.id, { is_active: !skill.is_active }).then(() =>
                    location.reload()
                  ),
              },
              {
                icon: Trash2,
                label: "Delete",
                tone: "destructive",
                onClick: () => {
                  if (confirm(`Delete "${skill.title}"?`)) {
                    deleteSkillAction(skill.id).then(() => location.reload());
                  }
                },
              },
            ]}
          />
        )}
      />
    </div>
  );
}
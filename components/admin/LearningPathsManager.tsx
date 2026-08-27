"use client";

import { useActionState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { RowActions } from "@/components/admin/RowActions";
import { StatusDot } from "@/components/admin/StatusDot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  createLearningPathAction,
  deleteLearningPathAction,
  updateLearningPathAction,
} from "@/lib/admin-actions";
import type { LearningPath } from "@/lib/api/courses-api";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

const columns: DataColumn<LearningPath>[] = [
  {
    key: "title",
    header: "Title",
    sortValue: (p) => p.title,
    render: (p) => (
      <div>
        <span className="font-medium">{p.title}</span>
        <span className="block text-xs text-muted-foreground">{p.slug}</span>
      </div>
    ),
  },
  {
    key: "kind",
    header: "Kind",
    render: (p) => <Badge variant="outline">{p.kind}</Badge>,
  },
  {
    key: "duration_weeks",
    header: "Weeks",
    sortValue: (p) => p.duration_weeks,
    render: (p) => <span className="tabular-nums">{p.duration_weeks}</span>,
  },
  {
    key: "is_active",
    header: "Status",
    render: (p) => <StatusDot status={p.is_active ? "active" : "draft"} />,
  },
];

function LearningPathForm() {
  const [state, formAction, pending] = useActionState(createLearningPathAction, { ok: false });

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-semibold">New learning path</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="lp-title" className="text-xs font-medium text-foreground">Title</label>
          <input id="lp-title" name="title" required placeholder="Backend Foundations" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="kind" className="text-xs font-medium text-foreground">Kind</label>
          <select id="kind" name="kind" defaultValue="skill" className={inputClass}>
            <option value="skill">Skill Path</option>
            <option value="career">Career Path</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="duration_weeks" className="text-xs font-medium text-foreground">Duration (weeks)</label>
          <input id="duration_weeks" name="duration_weeks" type="number" min="0" defaultValue="0" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="order" className="text-xs font-medium text-foreground">Display order</label>
          <input id="order" name="order" type="number" min="0" defaultValue="0" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="includes_certificate" className="text-xs font-medium text-foreground">Certificate</label>
          <select id="includes_certificate" name="includes_certificate" defaultValue="0" className={inputClass}>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="lp-active" className="text-xs font-medium text-foreground">Active</label>
          <select id="lp-active" name="is_active" defaultValue="1" className={inputClass}>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="lp-description" className="text-xs font-medium text-foreground">Description</label>
          <input id="lp-description" name="description" placeholder="Short description" className={inputClass} />
        </div>
      </div>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        <Plus size={15} /> Create
      </Button>
    </form>
  );
}

export function LearningPathsManager({ paths }: { paths: LearningPath[] }) {
  return (
    <div className="space-y-4">
      <LearningPathForm />
      <DataTable
        rows={paths}
        rowKey={(p) => p.id}
        columns={columns}
        renderRowActions={(path) => (
          <RowActions
            actions={[
              {
                icon: Pencil,
                label: path.is_active ? "Deactivate" : "Activate",
                onClick: () =>
                  updateLearningPathAction(path.id, { is_active: !path.is_active }).then(() =>
                    location.reload()
                  ),
              },
              {
                icon: Trash2,
                label: "Delete",
                tone: "destructive",
                onClick: () => {
                  if (confirm(`Delete "${path.title}"?`)) {
                    deleteLearningPathAction(path.id).then(() => location.reload());
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

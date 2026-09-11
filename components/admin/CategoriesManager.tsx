"use client";

import { useActionState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { RowActions } from "@/components/admin/RowActions";
import { StatusDot } from "@/components/admin/StatusDot";
import { Button } from "@/components/ui/button";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/lib/admin-actions";
import type { CourseType } from "@/lib/api/courses-api";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

const columns: DataColumn<CourseType>[] = [
  {
    key: "name",
    header: "Name",
    sortValue: (t) => t.name,
    render: (t) => <span className="font-medium">{t.name}</span>,
  },
  {
    key: "slug",
    header: "Slug",
    sortValue: (t) => t.slug,
    render: (t) => <span className="text-muted-foreground">{t.slug}</span>,
  },
  {
    key: "is_virtual",
    header: "Virtual",
    render: (t) => (
      <span className="text-sm">{t.is_virtual ? "Yes" : "No"}</span>
    ),
  },
  {
    key: "is_active",
    header: "Status",
    render: (t) => <StatusDot status={t.is_active ? "active" : "draft"} />,
  },
];

function CategoryForm() {
  const [state, formAction, pending] = useActionState(createCategoryAction, { ok: false });

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-semibold">New category</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="name" className="text-xs font-medium text-foreground">Name</label>
          <input id="name" name="name" required placeholder="Bootcamp" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="description" className="text-xs font-medium text-foreground">Description</label>
          <input id="description" name="description" placeholder="Short description" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="is_virtual" className="text-xs font-medium text-foreground">Virtual</label>
          <select id="is_virtual" name="is_virtual" defaultValue="0" className={inputClass}>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="is_active" className="text-xs font-medium text-foreground">Active</label>
          <select id="is_active" name="is_active" defaultValue="1" className={inputClass}>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
      </div>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        <Plus size={15} /> Create
      </Button>
    </form>
  );
}

export function CategoriesManager({ categories }: { categories: CourseType[] }) {
  return (
    <div className="space-y-4">
      <CategoryForm />
      <DataTable
        rows={categories}
        rowKey={(t) => t.id}
        columns={columns}
        renderRowActions={(category) => (
          <RowActions
            actions={[
              {
                icon: Pencil,
                label: category.is_active ? "Deactivate" : "Activate",
                onClick: () =>
                  updateCategoryAction(category.id, { is_active: !category.is_active }).then(() =>
                    location.reload()
                  ),
              },
              {
                icon: Trash2,
                label: "Delete",
                tone: "destructive",
                onClick: () => {
                  if (confirm(`Delete "${category.name}"?`)) {
                    deleteCategoryAction(category.id).then(() => location.reload());
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

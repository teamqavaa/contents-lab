import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/PageHeader";
import { RowActions } from "@/components/admin/RowActions";
import { categories } from "@/lib/admin-data";

export default function CategoriesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Categories" count={categories.length} />

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className={
              "flex items-center justify-between gap-4 px-4 py-2.5 transition-colors hover:bg-muted/40" +
              (index < categories.length - 1 ? " border-b border-border" : "")
            }
          >
            <span className="text-sm font-medium">{category.name}</span>
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-muted-foreground">
                {category.slug}
              </span>
              <span className="w-8 text-right text-sm tabular-nums text-zinc-500">
                {category.courses}
              </span>
              <RowActions
                actions={[
                  { icon: Pencil, label: "Edit" },
                  { icon: Trash2, label: "Delete", tone: "destructive" },
                ]}
              />
            </div>
          </div>
        ))}

        <div className="flex items-center gap-2 border-t border-border bg-zinc-50 px-4 py-3">
          <input
            type="text"
            placeholder="New category name..."
            aria-label="New category name"
            className="h-8 w-full max-w-xs rounded-lg border border-border bg-white px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
          <Button>
            <Plus />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createDjangoOutcomeAction,
  deleteDjangoOutcomeAction,
  updateDjangoOutcomeAction,
} from "@/lib/admin-actions";
import type { DjangoCourseOutcome, DjangoOutcomeCategory } from "@/lib/api/courses-api";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";
const textareaClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

const OUTCOME_CATEGORIES: { value: DjangoOutcomeCategory; label: string }[] = [
  { value: "SKILL", label: "Competence" },
  { value: "KNOWLEDGE", label: "Knowledge" },
  { value: "TOOL", label: "Tool mastery" },
  { value: "CERTIFICATION", label: "Certification prep" },
  { value: "OTHER", label: "Other" },
];

export function OutcomesPanel({
  courseId,
  items,
  onRefresh,
}: {
  courseId: string;
  items: DjangoCourseOutcome[];
  onRefresh: () => void;
}) {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    description: "",
    category: "SKILL" as DjangoOutcomeCategory,
    icon: "",
  });
  const [busy, setBusy] = useState(false);

  function reset() {
    setForm({ description: "", category: "SKILL", icon: "" });
    setAdding(false);
    setEditingId(null);
  }

  async function add() {
    if (!form.description.trim()) return;
    setBusy(true);
    const res = await createDjangoOutcomeAction({
      course: courseId,
      description: form.description.trim(),
      category: form.category,
      icon: form.icon || undefined,
      order: sorted.length + 1,
      is_highlighted: false,
      is_published: true,
    });
    setBusy(false);
    if (res.ok) {
      reset();
      onRefresh();
    }
  }

  async function saveEdit(id: string) {
    if (!form.description.trim()) return;
    setBusy(true);
    await updateDjangoOutcomeAction(id, {
      description: form.description.trim(),
      category: form.category,
      icon: form.icon || null,
    });
    setBusy(false);
    reset();
    onRefresh();
  }

  async function remove(id: string) {
    setBusy(true);
    await deleteDjangoOutcomeAction(id);
    setBusy(false);
    onRefresh();
  }

  return (
    <div className="space-y-2">
      {sorted.length === 0 && !adding && (
        <p className="text-xs text-muted-foreground">No outcomes yet.</p>
      )}
      {sorted.map((o) => (
        <div
          key={o.id}
          className="flex items-start gap-2 rounded-md border border-border bg-white px-3 py-2"
        >
          {editingId === o.id ? (
            <div className="flex flex-1 flex-col gap-1.5">
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className={textareaClass}
                autoFocus
              />
              <div className="flex gap-2">
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, category: e.target.value as DjangoOutcomeCategory }))
                  }
                  className={inputClass}
                >
                  {OUTCOME_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  value={form.icon}
                  onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                  placeholder="Icon (optional)"
                  className={inputClass}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 text-sm">
              <span className="mr-1.5 text-muted-foreground">{o.order}.</span>
              {o.description}
              <span className="ml-2 inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {OUTCOME_CATEGORIES.find((c) => c.value === o.category)?.label ?? o.category}
              </span>
              {o.icon && (
                <span className="ml-1 text-xs text-muted-foreground">[{o.icon}]</span>
              )}
            </div>
          )}
          <div className="flex gap-1">
            {editingId === o.id ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => saveEdit(o.id)}
                >
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={reset}>
                  <X size={13} />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(o.id);
                    setForm({
                      description: o.description,
                      category: o.category,
                      icon: o.icon ?? "",
                    });
                  }}
                >
                  <Pencil size={13} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    if (confirm("Delete this outcome?")) remove(o.id);
                  }}
                >
                  <Trash2 size={13} />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}

      {adding ? (
        <div className="space-y-1.5 rounded-md border border-border bg-zinc-50 p-3">
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="What students will be able to do..."
            className={textareaClass}
            autoFocus
          />
          <div className="flex gap-2">
            <select
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({ ...p, category: e.target.value as DjangoOutcomeCategory }))
              }
              className={inputClass}
            >
              {OUTCOME_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              value={form.icon}
              onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
              placeholder="Icon (optional)"
              className={inputClass}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={busy || !form.description.trim()} onClick={add}>
              <Plus size={13} /> Add
            </Button>
            <Button size="sm" variant="ghost" onClick={reset}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setForm({ description: "", category: "SKILL", icon: "" });
            setAdding(true);
          }}
        >
          <Plus size={13} /> Add outcome
        </Button>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createDjangoLearningPointAction,
  deleteDjangoLearningPointAction,
  updateDjangoLearningPointAction,
} from "@/lib/admin-actions";
import type { DjangoCourseLearningPoint } from "@/lib/api/courses-api";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";
const textareaClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

export function LearningPointsPanel({
  courseId,
  items,
  onRefresh,
}: {
  courseId: string;
  items: DjangoCourseLearningPoint[];
  onRefresh: () => void;
}) {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", icon: "" });
  const [busy, setBusy] = useState(false);

  function reset() {
    setForm({ title: "", description: "", icon: "" });
    setAdding(false);
    setEditingId(null);
  }

  async function add() {
    if (!form.title.trim()) return;
    setBusy(true);
    const res = await createDjangoLearningPointAction({
      course: courseId,
      title: form.title.trim(),
      description: form.description.trim(),
      icon: form.icon || undefined,
      order: sorted.length + 1,
      is_published: true,
    });
    setBusy(false);
    if (res.ok) {
      reset();
      onRefresh();
    }
  }

  async function saveEdit(id: string) {
    if (!form.title.trim()) return;
    setBusy(true);
    await updateDjangoLearningPointAction(id, {
      title: form.title.trim(),
      description: form.description.trim(),
      icon: form.icon || null,
    });
    setBusy(false);
    reset();
    onRefresh();
  }

  async function remove(id: string) {
    setBusy(true);
    await deleteDjangoLearningPointAction(id);
    setBusy(false);
    onRefresh();
  }

  return (
    <div className="space-y-2">
      {sorted.length === 0 && !adding && (
        <p className="text-xs text-muted-foreground">No learning points yet.</p>
      )}
      {sorted.map((lp) => (
        <div
          key={lp.id}
          className="flex items-start gap-2 rounded-md border border-border bg-white px-3 py-2"
        >
          {editingId === lp.id ? (
            <div className="flex flex-1 flex-col gap-1.5">
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Title"
                className={inputClass}
                autoFocus
              />
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description (optional)"
                className={textareaClass}
              />
              <input
                value={form.icon}
                onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                placeholder="Icon (optional)"
                className={inputClass}
              />
            </div>
          ) : (
            <div className="flex-1 text-sm">
              <span className="mr-1.5 text-muted-foreground">{lp.order}.</span>
              <span className="font-medium">{lp.title}</span>
              {lp.description && (
                <span className="ml-1 text-muted-foreground">
                  — {lp.description}
                </span>
              )}
              {lp.icon && (
                <span className="ml-1 text-xs text-muted-foreground">[{lp.icon}]</span>
              )}
            </div>
          )}
          <div className="flex gap-1">
            {editingId === lp.id ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => saveEdit(lp.id)}
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
                    setEditingId(lp.id);
                    setForm({
                      title: lp.title,
                      description: lp.description ?? "",
                      icon: lp.icon ?? "",
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
                    if (confirm("Delete this learning point?")) remove(lp.id);
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
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Learning point title"
            className={inputClass}
            autoFocus
          />
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Description (optional)"
            className={textareaClass}
          />
          <input
            value={form.icon}
            onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
            placeholder="Icon (optional)"
            className={inputClass}
          />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={busy || !form.title.trim()} onClick={add}>
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
            setForm({ title: "", description: "", icon: "" });
            setAdding(true);
          }}
        >
          <Plus size={13} /> Add learning point
        </Button>
      )}
    </div>
  );
}

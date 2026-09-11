"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createDjangoLessonAction,
  deleteDjangoModuleAction,
  updateDjangoModuleAction,
} from "@/lib/admin-actions";
import type { DjangoLesson, DjangoLessonType, DjangoModule } from "@/lib/api/courses-api";
import type { Lab } from "@/lib/api/lab-api";
import { LessonRow } from "./LessonRow";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

const LESSON_TYPES: { value: DjangoLessonType; label: string }[] = [
  { value: "VIDEO", label: "Video" },
  { value: "ARTICLE", label: "Article" },
  { value: "DOCUMENT", label: "Document" },
  { value: "QUIZ", label: "Quiz" },
];

export function ModuleCard({
  module,
  lessons,
  drLabs,
  onRefresh,
}: {
  module: DjangoModule;
  lessons: DjangoLesson[];
  drLabs: Lab[];
  onRefresh: () => void;
}) {
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [order, setOrder] = useState(module.order);
  const [isPublished, setIsPublished] = useState(module.is_published);
  const [isFree, setIsFree] = useState(module.is_free);
  const [description, setDescription] = useState(module.description ?? "");
  const [busy, setBusy] = useState(false);

  // Add lesson
  const [addingLesson, setAddingLesson] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState<DjangoLessonType>("VIDEO");
  const [lessonDuration, setLessonDuration] = useState(0);

  async function saveModule() {
    setBusy(true);
    await updateDjangoModuleAction(module.id, {
      title,
      order,
      is_published: isPublished,
      is_free: isFree,
      description,
    });
    setBusy(false);
    setEditing(false);
    onRefresh();
  }

  async function deleteModule() {
    setBusy(true);
    // La suppression du module cascade vers les leçons et vidéos.
    await deleteDjangoModuleAction(module.id);
    setBusy(false);
    onRefresh();
  }

  async function addLesson() {
    if (!lessonTitle.trim()) return;
    setBusy(true);
    const res = await createDjangoLessonAction({
      module: module.id,
      title: lessonTitle.trim(),
      lesson_type: lessonType,
      duration_in_minutes: lessonDuration,
      order: sortedLessons.length + 1,
      is_published: true,
      is_preview: false,
    });
    setBusy(false);
    if (res.ok) {
      setLessonTitle("");
      setLessonDuration(0);
      setAddingLesson(false);
      onRefresh();
    }
  }

  return (
    <div className="rounded-lg border border-border bg-white">
      <div className="flex items-center gap-1 p-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-1"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </Button>

        {editing ? (
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Module title"
              className={inputClass + " flex-1 min-w-[160px]"}
              autoFocus
            />
            <input
              type="number"
              value={order}
              min="1"
              onChange={(e) => setOrder(Number(e.target.value))}
              className={inputClass + " w-20"}
              title="Order"
            />
            <select
              value={isPublished ? "published" : "draft"}
              onChange={(e) => setIsPublished(e.target.value === "published")}
              className={inputClass + " w-28"}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <label className="flex items-center gap-1 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />
              Free
            </label>
          </div>
        ) : (
          <div className="flex-1 text-sm font-medium text-foreground">
            <span className="mr-1.5 text-muted-foreground">{module.order}.</span>
            {module.title}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {sortedLessons.length} lesson{sortedLessons.length === 1 ? "" : "s"}
            </span>
            {module.is_free && (
              <span className="ml-1.5 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                free
              </span>
            )}
          </div>
        )}

        <div className="flex gap-1">
          {editing ? (
            <>
              <Button size="sm" variant="outline" disabled={busy} onClick={saveModule}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setTitle(module.title);
                  setOrder(module.order);
                  setIsPublished(module.is_published);
                  setIsFree(module.is_free);
                  setDescription(module.description ?? "");
                  setEditing(true);
                }}
              >
                <Pencil size={13} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  if (confirm(`Delete module "${module.title}"? This also deletes its lessons.`)) {
                    deleteModule();
                  }
                }}
              >
                <Trash2 size={13} />
              </Button>
            </>
          )}
        </div>
      </div>

      {editing && (
        <div className="px-4 pb-3">
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Module description / objectives (optional)"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      )}

      {open && (
        <div className="border-t border-border px-3 py-3">
          {sortedLessons.length === 0 && !addingLesson && (
            <p className="mb-2 text-xs text-muted-foreground">No lessons yet.</p>
          )}
          <ul className="space-y-1.5">
            {sortedLessons.map((l) => (
              <LessonRow key={l.id} lesson={l} drLabs={drLabs} onRefresh={onRefresh} />
            ))}
          </ul>

          {addingLesson ? (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-zinc-50 p-2">
              <input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Lesson title"
                className={inputClass + " flex-1 min-w-[160px]"}
                autoFocus
              />
              <select
                value={lessonType}
                onChange={(e) => setLessonType(e.target.value as DjangoLessonType)}
                className={inputClass + " w-28"}
              >
                {LESSON_TYPES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={lessonDuration}
                min="0"
                onChange={(e) => setLessonDuration(Number(e.target.value))}
                placeholder="min"
                className={inputClass + " w-16"}
              />
              <Button
                size="sm"
                variant="outline"
                disabled={busy || !lessonTitle.trim()}
                onClick={addLesson}
              >
                <Plus size={13} /> Add
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAddingLesson(false)}>
                <X size={13} />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => setAddingLesson(true)}
            >
              <Plus size={13} /> Add lesson
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

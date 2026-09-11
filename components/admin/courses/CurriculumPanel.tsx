"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createDjangoModuleAction,
} from "@/lib/admin-actions";
import type { DjangoLesson, DjangoModule, DjangoVideo } from "@/lib/api/courses-api";
import type { Lab } from "@/lib/api/lab-api";
import { ModuleCard } from "./ModuleCard";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

function attachVideosToLessons(
  lessons: DjangoLesson[],
  videos: DjangoVideo[]
): DjangoLesson[] {
  const byLesson: Record<string, DjangoVideo> = {};
  for (const v of videos) byLesson[v.lesson] = v;
  return lessons.map((l) => ({ ...l, video: byLesson[l.id] ?? null }));
}

export function CurriculumPanel({
  courseId,
  modules,
  lessons,
  videos,
  drLabs,
  onRefresh,
}: {
  courseId: string;
  modules: DjangoModule[];
  lessons: DjangoLesson[];
  videos: DjangoVideo[];
  drLabs: Lab[];
  onRefresh: () => void;
}) {
  const sortedModules = [...modules].sort((a, b) => a.order - b.order);
  const [adding, setAdding] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleFree, setModuleFree] = useState(false);
  const [busy, setBusy] = useState(false);

  const lessonsByModule: Record<string, DjangoLesson[]> = {};
  for (const l of lessons) {
    if (!lessonsByModule[l.module]) lessonsByModule[l.module] = [];
    lessonsByModule[l.module].push(l);
  }

  async function addModule() {
    if (!moduleTitle.trim()) return;
    setBusy(true);
    const res = await createDjangoModuleAction({
      course: courseId,
      title: moduleTitle.trim(),
      order: sortedModules.length + 1,
      is_published: true,
      is_free: moduleFree,
    });
    setBusy(false);
    if (res.ok) {
      setModuleTitle("");
      setModuleFree(false);
      setAdding(false);
      onRefresh();
    }
  }

  return (
    <div className="space-y-2">
      {sortedModules.length === 0 && !adding && (
        <p className="text-xs text-muted-foreground">No modules yet — add the first one below.</p>
      )}
      {sortedModules.map((m) => (
        <ModuleCard
          key={m.id}
          module={m}
          lessons={attachVideosToLessons(lessonsByModule[m.id] ?? [], videos)}
          drLabs={drLabs}
          onRefresh={onRefresh}
        />
      ))}

      {adding ? (
        <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-zinc-50 p-3">
          <input
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            placeholder="Module title"
            className={inputClass + " flex-1 min-w-[180px]"}
            autoFocus
          />
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={moduleFree}
              onChange={(e) => setModuleFree(e.target.checked)}
            />
            Free module
          </label>
          <Button
            size="sm"
            variant="outline"
            disabled={busy || !moduleTitle.trim()}
            onClick={addModule}
          >
            <Plus size={13} /> Add module
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
            <X size={13} />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setAdding(true)}
        >
          <Plus size={13} /> Add module
        </Button>
      )}
    </div>
  );
}

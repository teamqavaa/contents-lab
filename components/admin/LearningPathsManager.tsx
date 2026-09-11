"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { RowActions } from "@/components/admin/RowActions";
import { StatusDot } from "@/components/admin/StatusDot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  createLearningPathAction,
  createPathOutcomeAction,
  createPathPrerequisiteAction,
  deleteLearningPathAction,
  deletePathOutcomeAction,
  deletePathPrerequisiteAction,
  listPathOutcomesAction,
  listPathPrerequisitesAction,
  updateLearningPathAction,
  updatePathOutcomeAction,
  updatePathPrerequisiteAction,
} from "@/lib/admin-actions";
import type {
  Course,
  LearningPath,
  LearningPathOutcome,
  LearningPathPrerequisite,
} from "@/lib/api/courses-api";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

// Must match the learning-paths model ICON_CHOICES; the API rejects free text.
const ICON_CHOICES = [
  ["git", "Git"],
  ["api", "API"],
  ["sql", "SQL"],
  ["cli", "Command line"],
  ["docker", "Docker"],
  ["data-viz", "Data visualization"],
  ["testing", "Testing"],
  ["security", "Security"],
  ["backend", "Backend"],
  ["frontend", "Frontend"],
  ["data", "Data"],
  ["cloud", "Cloud"],
  ["mobile", "Mobile"],
] as const;

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
    key: "courses",
    header: "Courses",
    sortValue: (p) => p.courses.length,
    render: (p) => <span className="tabular-nums text-muted-foreground">{p.courses.length}</span>,
  },
  {
    key: "is_active",
    header: "Status",
    render: (p) => <StatusDot status={p.is_active ? "active" : "draft"} />,
  },
];

// Multi-select course picker that keeps its own checkbox state, used by the
// edit panel where form values are managed in React rather than the DOM.
function CoursePicker({
  courses,
  selected,
  onChange,
}: {
  courses: Course[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
    );
  }

  return (
    <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-input p-2">
      {courses.length === 0 && (
        <p className="text-xs text-muted-foreground">No courses available.</p>
      )}
      {courses.map((course) => (
        <label key={course.id} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selected.includes(course.slug)}
            onChange={() => toggle(course.slug)}
          />
          <span className="text-foreground">
            {course.title}
            <span className="ml-1 text-xs text-muted-foreground">(#{course.slug})</span>
          </span>
        </label>
      ))}
    </div>
  );
}

// Dynamic list of text bullets (outcomes or prerequisites) with add/remove.
function BulletList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: { id?: number; order: number; content: string }[];
  onChange: (items: { id?: number; order: number; content: string }[]) => void;
}) {
  function updateContent(index: number, content: string) {
    const next = items.map((item, i) => (i === index ? { ...item, content } : item));
    onChange(next);
  }

  function addItem() {
    onChange([...items, { order: items.length + 1, content: "" }]);
  }

  function removeItem(index: number) {
    const next = items.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i + 1 }));
    onChange(next);
  }

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground">{label}</label>
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground">No items yet.</p>
      )}
      {items.map((item, i) => (
        <div key={item.id ?? `new-${i}`} className="flex gap-1">
          <input
            value={item.content}
            onChange={(e) => updateContent(i, e.target.value)}
            placeholder={`${label} ${i + 1}`}
            className={inputClass}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-9 flex-shrink-0 px-0"
            onClick={() => removeItem(i)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus size={13} /> Add
      </Button>
    </div>
  );
}

function LearningPathForm({ courses }: { courses: Course[] }) {
  return (
    <form
      action={(formData) => {
        createLearningPathAction({ ok: false }, formData);
      }}
      className="space-y-3 rounded-xl border border-border bg-card p-4"
    >
      <p className="text-sm font-semibold">New learning path</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Title</label>
          <input name="title" required placeholder="Backend Foundations" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Kind</label>
          <select name="kind" defaultValue="skill" className={inputClass}>
            <option value="skill">Skill Path</option>
            <option value="career">Career Path</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Icon</label>
          <select name="icon" defaultValue="" className={inputClass}>
            <option value="">None</option>
            {ICON_CHOICES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Pace</label>
          <input name="pace" placeholder="self-paced" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Duration (weeks)</label>
          <input name="duration_weeks" type="number" min="0" defaultValue="0" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Display order</label>
          <input name="order" type="number" min="0" defaultValue="0" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Certificate</label>
          <select name="includes_certificate" defaultValue="0" className={inputClass}>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Active</label>
          <select name="is_active" defaultValue="1" className={inputClass}>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-foreground">Description</label>
          <input name="description" placeholder="Short description" className={inputClass} />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Courses</label>
        <div className="max-h-48 overflow-y-auto rounded-md border border-input p-2">
          {courses.length === 0 ? (
            <p className="text-xs text-muted-foreground">No courses available.</p>
          ) : (
            courses.map((course) => (
              <label key={course.id} className="flex items-center gap-2 py-0.5 text-sm">
                <input type="checkbox" name="courses" value={course.slug} />
                <span className="text-foreground">
                  {course.title}
                  <span className="ml-1 text-xs text-muted-foreground">(#{course.slug})</span>
                </span>
              </label>
            ))
          )}
        </div>
      </div>
      <Button type="submit">
        <Plus size={15} /> Create
      </Button>
    </form>
  );
}

// Edit panel: base fields, course picker, outcomes, prerequisites.
function LearningPathEditPanel({
  path,
  courses,
}: {
  path: LearningPath;
  courses: Course[];
}) {
  const [fields, setFields] = useState({
    title: path.title,
    description: path.description ?? "",
    icon: path.icon,
    pace: path.pace,
    kind: path.kind,
    duration_weeks: path.duration_weeks,
    includes_certificate: path.includes_certificate,
    order: path.order,
    is_active: path.is_active,
  });
  const [selectedCourses, setSelectedCourses] = useState<string[]>(path.courses);
  const [outcomes, setOutcomes] = useState<{ id?: number; order: number; content: string }[]>([]);
  const [prerequisites, setPrerequisites] = useState<{ id?: number; order: number; content: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing outcomes and prerequisites on mount.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [outRes, preRes] = await Promise.all([
        listPathOutcomesAction(path.id),
        listPathPrerequisitesAction(path.id),
      ]);
      if (cancelled) return;
      setOutcomes((outRes.data ?? []).map((o) => ({ id: o.id, order: o.order, content: o.content })));
      setPrerequisites((preRes.data ?? []).map((p) => ({ id: p.id, order: p.order, content: p.content })));
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [path.id]);

  async function save() {
    setSaving(true);

    // 1. Update path fields.
    await updateLearningPathAction(path.id, {
      title: fields.title,
      description: fields.description || null,
      icon: fields.icon,
      pace: fields.pace,
      kind: fields.kind,
      duration_weeks: fields.duration_weeks,
      includes_certificate: fields.includes_certificate,
      order: fields.order,
      is_active: fields.is_active,
      courses: selectedCourses,
    });

    // 2. Reconcile outcomes: create new, update existing, delete removed.
    const existingOutcomes = outcomes.filter((o) => o.id != null);
    const newOutcomes = outcomes.filter((o) => o.id == null);

    // Delete outcomes that were removed.
    const currentOutcomeIds = new Set(outcomes.filter((o) => o.id != null).map((o) => o.id));
    const originalOutcomes = await listPathOutcomesAction(path.id);
    for (const orig of originalOutcomes.data ?? []) {
      if (!currentOutcomeIds.has(orig.id)) {
        await deletePathOutcomeAction(path.id, orig.id);
      }
    }

    // Update existing outcomes.
    for (const o of existingOutcomes) {
      await updatePathOutcomeAction(path.id, o.id!, { order: o.order, content: o.content });
    }

    // Create new outcomes.
    for (const o of newOutcomes) {
      await createPathOutcomeAction(path.id, { order: o.order, content: o.content });
    }

    // 3. Reconcile prerequisites: same pattern.
    const existingPres = prerequisites.filter((p) => p.id != null);
    const newPres = prerequisites.filter((p) => p.id == null);

    const currentPreIds = new Set(prerequisites.filter((p) => p.id != null).map((p) => p.id));
    const originalPres = await listPathPrerequisitesAction(path.id);
    for (const orig of originalPres.data ?? []) {
      if (!currentPreIds.has(orig.id)) {
        await deletePathPrerequisiteAction(path.id, orig.id);
      }
    }

    for (const p of existingPres) {
      await updatePathPrerequisiteAction(path.id, p.id!, { order: p.order, content: p.content });
    }

    for (const p of newPres) {
      await createPathPrerequisiteAction(path.id, { order: p.order, content: p.content });
    }

    setSaving(false);
    location.reload();
  }

  return (
    <div className="mb-6 space-y-4 rounded-xl border border-border bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Edit path — {path.title}</p>
        <Button type="button" size="sm" onClick={save} disabled={saving || loading}>
          {saving ? "Saving…" : "Save path"}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Title</label>
          <input value={fields.title} onChange={(e) => setFields({ ...fields, title: e.target.value })} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Kind</label>
          <select
            value={fields.kind}
            onChange={(e) => setFields({ ...fields, kind: e.target.value as LearningPath["kind"] })}
            className={inputClass}
          >
            <option value="skill">Skill Path</option>
            <option value="career">Career Path</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Icon</label>
          <select
            value={fields.icon}
            onChange={(e) => setFields({ ...fields, icon: e.target.value })}
            className={inputClass}
          >
            <option value="">None</option>
            {ICON_CHOICES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Pace</label>
          <input value={fields.pace} onChange={(e) => setFields({ ...fields, pace: e.target.value })} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Duration (weeks)</label>
          <input type="number" value={fields.duration_weeks} onChange={(e) => setFields({ ...fields, duration_weeks: Number(e.target.value) })} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Display order</label>
          <input type="number" value={fields.order} onChange={(e) => setFields({ ...fields, order: Number(e.target.value) })} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Certificate</label>
          <select
            value={fields.includes_certificate ? "1" : "0"}
            onChange={(e) => setFields({ ...fields, includes_certificate: e.target.value === "1" })}
            className={inputClass}
          >
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Active</label>
          <select
            value={fields.is_active ? "1" : "0"}
            onChange={(e) => setFields({ ...fields, is_active: e.target.value === "1" })}
            className={inputClass}
          >
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-foreground">Description</label>
          <input value={fields.description} onChange={(e) => setFields({ ...fields, description: e.target.value })} className={inputClass} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-foreground">Courses</label>
          <CoursePicker courses={courses} selected={selectedCourses} onChange={setSelectedCourses} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          {loading ? (
            <p className="text-xs text-muted-foreground">Loading bullets…</p>
          ) : (
            <>
              <BulletList label="What you'll learn" items={outcomes} onChange={setOutcomes} />
              <div className="mt-3" />
              <BulletList label="Prerequisites" items={prerequisites} onChange={setPrerequisites} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function LearningPathsManager({
  paths,
  courses,
}: {
  paths: LearningPath[];
  courses: Course[];
}) {
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);

  if (editingPath) {
    return (
      <div className="space-y-4">
        <LearningPathEditPanel path={editingPath} courses={courses} />
        <Button variant="outline" onClick={() => setEditingPath(null)}>
          <X size={15} /> Close editor
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LearningPathForm courses={courses} />
      <DataTable
        rows={paths}
        rowKey={(p) => p.id}
        columns={columns}
        renderRowActions={(path) => (
          <RowActions
            actions={[
              {
                icon: Pencil,
                label: "Edit path",
                onClick: () => setEditingPath(path),
              },
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

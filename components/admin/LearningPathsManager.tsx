"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

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
import type { Course, LearningPath } from "@/lib/api/courses-api";

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
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  function toggle(id: number) {
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
            checked={selected.includes(course.id)}
            onChange={() => toggle(course.id)}
          />
          <span className="text-foreground">
            {course.title}
            <span className="ml-1 text-xs text-muted-foreground">(#{course.id})</span>
          </span>
        </label>
      ))}
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
          <input name="icon" placeholder="rocket" className={inputClass} />
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
                <input type="checkbox" name="courses" value={course.id} />
                <span className="text-foreground">
                  {course.title}
                  <span className="ml-1 text-xs text-muted-foreground">(#{course.id})</span>
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

// Edit panel: base fields plus a live course picker saved to the path.
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
  const [selectedCourses, setSelectedCourses] = useState<number[]>(path.courses);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
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
    setSaving(false);
    location.reload();
  }

  return (
    <div className="mb-6 space-y-4 rounded-xl border border-border bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Edit path — {path.title}</p>
        <Button type="button" size="sm" onClick={save} disabled={saving}>
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
          <input value={fields.icon} onChange={(e) => setFields({ ...fields, icon: e.target.value })} className={inputClass} />
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

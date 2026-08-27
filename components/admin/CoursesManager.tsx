"use client";

import { useActionState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { RowActions } from "@/components/admin/RowActions";
import { StatusDot } from "@/components/admin/StatusDot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  createCourseAction,
  deleteCourseAction,
  updateCourseAction,
} from "@/lib/admin-actions";
import type { Course, CourseType } from "@/lib/api/courses-api";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

const columns: DataColumn<Course>[] = [
  {
    key: "title",
    header: "Title",
    sortValue: (c) => c.title,
    render: (c) => (
      <div>
        <span className="font-medium">{c.title}</span>
        <span className="block text-xs text-muted-foreground">{c.instructor}</span>
      </div>
    ),
  },
  {
    key: "level",
    header: "Level",
    render: (c) => <Badge variant="outline">{c.level}</Badge>,
  },
  {
    key: "duration_minutes",
    header: "Duration",
    sortValue: (c) => c.duration_minutes,
    render: (c) => <span className="tabular-nums">{c.duration_minutes} min</span>,
  },
  {
    key: "is_active",
    header: "Status",
    render: (c) => <StatusDot status={c.is_active ? "active" : "draft"} />,
  },
];

function CourseForm({ courseTypes }: { courseTypes: CourseType[] }) {
  const [state, formAction, pending] = useActionState(createCourseAction, { ok: false });

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-semibold">New course</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="title" className="text-xs font-medium text-foreground">Title</label>
          <input id="title" name="title" required placeholder="Intro to Git" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="instructor" className="text-xs font-medium text-foreground">Instructor</label>
          <input id="instructor" name="instructor" placeholder="Amina Diallo" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="type" className="text-xs font-medium text-foreground">Category</label>
          <select id="type" name="type" className={inputClass} defaultValue="">
            <option value="">None</option>
            {courseTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="level" className="text-xs font-medium text-foreground">Level</label>
          <select id="level" name="level" defaultValue="beginner" className={inputClass}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="duration_minutes" className="text-xs font-medium text-foreground">Duration (minutes)</label>
          <input id="duration_minutes" name="duration_minutes" type="number" min="0" defaultValue="0" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="price" className="text-xs font-medium text-foreground">Price</label>
          <input id="price" name="price" type="number" step="0.01" min="0" defaultValue="0" className={inputClass} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="description" className="text-xs font-medium text-foreground">Description</label>
          <input id="description" name="description" placeholder="Short description" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="is_active" className="text-xs font-medium text-foreground">Active</label>
          <select id="is_active" name="is_active" defaultValue="0" className={inputClass}>
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

export function CoursesManager({
  courses,
  courseTypes,
}: {
  courses: Course[];
  courseTypes: CourseType[];
}) {
  return (
    <div className="space-y-4">
      <CourseForm courseTypes={courseTypes} />
      <DataTable
        rows={courses}
        rowKey={(c) => c.id}
        columns={columns}
        renderRowActions={(course) => (
          <RowActions
            actions={[
              {
                icon: Pencil,
                label: course.is_active ? "Deactivate" : "Activate",
                onClick: () =>
                  updateCourseAction(course.id, { is_active: !course.is_active }).then(() =>
                    location.reload()
                  ),
              },
              {
                icon: Trash2,
                label: "Delete",
                tone: "destructive",
                onClick: () => {
                  if (confirm(`Delete "${course.title}"?`)) {
                    deleteCourseAction(course.id).then(() => location.reload());
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

"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { RowActions } from "@/components/admin/RowActions";
import { StatusDot } from "@/components/admin/StatusDot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  createCourseAction,
  createCourseRelatedAction,
  createLessonAction,
  createModuleAction,
  createVideoAction,
  deleteCourseAction,
  deleteCourseRelatedAction,
  deleteLessonAction,
  deleteModuleAction,
  deleteVideoAction,
  updateCourseAction,
  updateCourseRelatedAction,
  updateLessonAction,
  updateModuleAction,
  updateQuizLinkAction,
  updateVideoAction,
} from "@/lib/admin-actions";
import type {
  ContentTypeRow,
  Course,
  CourseRelatedInput,
  CourseRelatedItem,
  CourseRelatedKind,
  CourseType,
  Lesson,
  LessonVideo,
  Module,
  Quiz,
} from "@/lib/api/courses-api";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";
const textareaClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

export type RelatedByKind = {
  highlights: CourseRelatedItem[];
  outcomes: CourseRelatedItem[];
  learning_points: CourseRelatedItem[];
  requirements: CourseRelatedItem[];
};

const RELATED_ORDER: CourseRelatedKind[] = [
  "highlights",
  "outcomes",
  "learning_points",
  "requirements",
];

const RELATED_LABEL: Record<CourseRelatedKind, string> = {
  highlights: "Highlights",
  outcomes: "Outcomes",
  learning_points: "Learning points",
  requirements: "Requirements",
};

const columns: DataColumn<Course>[] = [
  {
    key: "title",
    header: "Title",
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
    key: "language",
    header: "Lang",
    render: (c) => <span className="text-muted-foreground uppercase">{c.language}</span>,
  },
  {
    key: "duration_minutes",
    header: "Duration",
    sortValue: (c) => c.duration_minutes,
    render: (c) => <span className="tabular-nums">{c.duration_minutes} min</span>,
  },
  {
    key: "price",
    header: "Price",
    sortValue: (c) => Number(c.price),
    render: (c) => <span className="tabular-nums">{c.price}</span>,
  },
  {
    key: "is_active",
    header: "Status",
    render: (c) => <StatusDot status={c.is_active ? "active" : "draft"} />,
  },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
function CourseForm({ courseTypes }: { courseTypes: CourseType[] }) {
  return (
    <form
      action={(formData) => {
        createCourseAction({ ok: false }, formData);
      }}
      className="space-y-3 rounded-xl border border-border bg-card p-4"
    >
      <p className="text-sm font-semibold">New course</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Title">
          <input name="title" required placeholder="Intro to Git" className={inputClass} />
        </Field>
        <Field label="Instructor">
          <input name="instructor" placeholder="Amina Diallo" className={inputClass} />
        </Field>
        <Field label="Category">
          <select name="type" className={inputClass} defaultValue="">
            <option value="">None</option>
            {courseTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Level">
          <select name="level" defaultValue="beginner" className={inputClass}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </Field>
        <Field label="Language">
          <input name="language" defaultValue="en" placeholder="en" className={inputClass} />
        </Field>
        <Field label="Duration (minutes)">
          <input name="duration_minutes" type="number" min="0" defaultValue="0" className={inputClass} />
        </Field>
        <Field label="Price">
          <input name="price" type="number" step="0.01" min="0" defaultValue="0" className={inputClass} />
        </Field>
        <Field label="Original price">
          <input name="original_price" type="number" step="0.01" min="0" className={inputClass} />
        </Field>
        <Field label="Rating">
          <input name="rating" type="number" step="0.1" min="0" max="5" className={inputClass} />
        </Field>
        <Field label="Review count">
          <input name="review_count" type="number" min="0" defaultValue="0" className={inputClass} />
        </Field>
        <Field label="Downloadable files">
          <input name="downloadable_files_count" type="number" min="0" defaultValue="0" className={inputClass} />
        </Field>
        <Field label="Cohort label">
          <input name="cohort_label" placeholder="Only 3 seats left" className={inputClass} />
        </Field>
        <Field label="Subtitle">
          <input name="subtitle" placeholder="Short subtitle" className={inputClass} />
        </Field>
        <Field label="Thumbnail URL">
          <input name="thumbnail" placeholder="https://…" className={inputClass} />
        </Field>
        <Field label="Active">
          <select name="is_active" defaultValue="0" className={inputClass}>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Audience">
            <textarea name="audience" rows={2} placeholder="Who this course is for" className={textareaClass} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Description">
            <textarea name="description" rows={2} placeholder="Course description" className={textareaClass} />
          </Field>
        </div>
      </div>
      <Button type="submit">
        <Plus size={15} /> Create
      </Button>
    </form>
  );
}
// Inline-style editor for one related kind, mirroring a Django tabular inline.
function RelatedPanel({
  kind,
  items,
  courseId,
}: {
  kind: CourseRelatedKind;
  items: CourseRelatedItem[];
  courseId: number;
}) {
  const rows = items
    .filter((item) => item.course === courseId)
    .sort((a, b) => a.order - b.order);
  const [draft, setDraft] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  async function add() {
    const content = draft.trim();
    if (!content) return;
    const input: CourseRelatedInput = {
      course: courseId,
      order: rows.length + 1,
      content,
    };
    const res = await createCourseRelatedAction(kind, input);
    if (res.ok) {
      setDraft("");
      location.reload();
    }
  }

  async function saveEdit() {
    if (editId == null) return;
    const content = editValue.trim();
    if (!content) return;
    await updateCourseRelatedAction(kind, editId, {
      course: courseId,
      order: 1,
      content,
    });
    location.reload();
  }

  return (
    <div className="rounded-lg border border-border bg-zinc-50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {RELATED_LABEL[kind]}
      </p>
      <ul className="space-y-1.5">
        {rows.length === 0 && (
          <li className="text-xs text-muted-foreground">No {kind} yet.</li>
        )}
        {rows.map((item, index) => (
          <li
            key={item.id}
            className="flex items-start gap-2 rounded-md border border-border bg-white px-3 py-2"
          >
            {editId === item.id ? (
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit();
                  if (e.key === "Escape") setEditId(null);
                }}
                className={inputClass}
                autoFocus
              />
            ) : (
              <span className="flex-1 text-sm text-foreground">
                <span className="mr-1.5 text-muted-foreground">{index + 1}.</span>
                {item.content}
              </span>
            )}
            <RowActions
              actions={[
                {
                  icon: Pencil,
                  label: "Edit",
                  onClick: () => {
                    setEditId(item.id);
                    setEditValue(item.content);
                  },
                },
                {
                  icon: Trash2,
                  label: "Delete",
                  tone: "destructive",
                  onClick: () => {
                    if (confirm("Delete this item?")) {
                      deleteCourseRelatedAction(kind, item.id).then(() => location.reload());
                    }
                  },
                },
              ]}
            />
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
          placeholder={`Add ${kind.replace(/_/g, " ")}…`}
          className={inputClass}
        />
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus size={14} /> Add
        </Button>
      </div>
    </div>
  );
}
// Inline editor for a quiz-type lesson: attach any unlinked quiz to this course
// by writing its polymorphic content_type/object_id (GenericForeignKey).
function QuizLinkPicker({
  quizzes,
  courseCtId,
  courseId,
}: {
  quizzes: Quiz[];
  courseCtId: number | undefined;
  courseId: number;
}) {
  const [busy, setBusy] = useState(false);
  const linked = quizzes.filter(
    (q) => q.content_type === courseCtId && q.object_id === courseId
  );
  const pool = quizzes.filter((q) => q.content_type == null);
  const current = linked.find((q) => q.object_id === courseId) ?? null;

  async function attach(quizId: string) {
    if (courseCtId == null || quizId === "") return;
    setBusy(true);
    const quiz = pool.find((q) => q.id === Number(quizId)) ?? current;
    if (!quiz) return;
    const res =
      quiz.content_type == null
        ? await updateQuizLinkAction(quiz.id, {
            content_type: courseCtId,
            object_id: courseId,
          })
        : { ok: false };
    setBusy(false);
    if (res.ok) location.reload();
  }

  if (courseCtId == null) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <select
        className={inputClass + " flex-1 min-w-[180px]"}
        value={current ? current.id : ""}
        disabled={busy}
        onChange={(e) => attach(e.target.value)}
      >
        <option value="">{current ? "Quiz attached" : "Attach a quiz…"}</option>
        {current && <option value={current.id}>{current.title}</option>}
        {pool.map((q) => (
          <option key={q.id} value={q.id}>
            {q.title}
          </option>
        ))}
      </select>
      {current && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await updateQuizLinkAction(current.id, {
              content_type: null,
              object_id: null,
            });
            setBusy(false);
            location.reload();
          }}
        >
          Unlink
        </Button>
      )}
    </div>
  );
}
function VideoEditor({ video }: { video: LessonVideo | null }) {
  const [url, setUrl] = useState(video?.url ?? "");
  const [duration, setDuration] = useState(
    video?.duration_seconds != null ? String(video.duration_seconds) : ""
  );
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function saveVideo() {
    if (!url.trim()) return;
    setBusy(true);
    const payload = {
      lesson: video!.lesson,
      url: url.trim(),
      duration_seconds: duration === "" ? null : Number(duration),
    };
    const res = video
      ? await updateVideoAction(video.id, payload)
      : await createVideoAction(payload);
    setBusy(false);
    if (res.ok) location.reload();
  }

  if (video && !showForm)
    return (
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="max-w-[300px] truncate font-mono">{video.url}</span>
        {video.duration_seconds != null && <span>{video.duration_seconds}s</span>}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setShowForm(true)}
        >
          <Pencil size={13} /> Edit video
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            if (confirm("Delete this video?"))
              deleteVideoAction(video.id).then(() => location.reload());
          }}
        >
          <Trash2 size={13} /> Delete
        </Button>
      </div>
    );
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://…/video.mp4"
        className={inputClass + " flex-1 min-w-[220px]"}
      />
      <input
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        placeholder="sec"
        type="number"
        className={inputClass + " w-20"}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={saveVideo}
        disabled={busy || !url.trim()}
      >
        <Plus size={13} /> {video ? "Update" : "Add video"}
      </Button>
      {video && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setShowForm(false)}
        >
          <X size={13} />
        </Button>
      )}
    </div>
  );
}
function LessonRow({
  lesson,
  videos,
  quizzes,
  courseCtId,
  courseId,
}: {
  lesson: Lesson;
  videos: LessonVideo[];
  quizzes: Quiz[];
  courseCtId: number | undefined;
  courseId: number;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [lessonType, setLessonType] = useState(lesson.lesson_type);
  const [order, setOrder] = useState(lesson.order);
  const [duration, setDuration] = useState(lesson.duration_minutes);
  const [isActive, setIsActive] = useState(lesson.is_active);
  const [busy, setBusy] = useState(false);
  const video = videos.find((v) => v.lesson === lesson.id) ?? null;

  async function save() {
    setBusy(true);
    await updateLessonAction(lesson.id, {
      module: lesson.module,
      lesson_type: lessonType,
      title,
      order,
      duration_minutes: duration,
      is_active: isActive,
    });
    location.reload();
  }

  return (
    <li className="rounded-md border border-border bg-white px-3 py-2">
      <div className="flex items-start gap-2">
        {editing ? (
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass + " flex-1 min-w-[160px]"} />
            <select value={lessonType} onChange={(e) => setLessonType(e.target.value as Lesson["lesson_type"])} className={inputClass + " w-28"}>
              <option value="video">Video</option>
              <option value="quiz">Quiz</option>
            </select>
            <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className={inputClass + " w-20"} />
            <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputClass + " w-20"} />
            <select value={isActive ? "1" : "0"} onChange={(e) => setIsActive(e.target.value === "1")} className={inputClass + " w-20"}>
              <option value="1">Active</option>
              <option value="0">Draft</option>
            </select>
          </div>
        ) : (
          <div className="flex-1 text-sm text-foreground">
            <span className="mr-1.5 text-muted-foreground">{lesson.order}.</span>
            {lesson.title}
            <Badge variant="outline" className="ml-2">
              {lesson.lesson_type}
            </Badge>
            <span className="ml-2 text-xs text-muted-foreground">
              {lesson.duration_minutes} min
            </span>
          </div>
        )}
        {editing ? (
          <Button type="button" size="sm" variant="outline" onClick={save} disabled={busy}>
            Save
          </Button>
        ) : (
          <RowActions
            actions={[
              {
                icon: Pencil,
                label: "Edit",
                onClick: () => setEditing(true),
              },
              {
                icon: Trash2,
                label: "Delete",
                tone: "destructive",
                onClick: () => {
                  if (confirm(`Delete lesson "${lesson.title}"?`))
                    deleteLessonAction(lesson.id).then(() => location.reload());
                },
              },
            ]}
          />
        )}
      </div>
      {lessonType === "video" ? (
        <VideoEditor video={video} />
      ) : (
        <QuizLinkPicker
          quizzes={quizzes}
          courseCtId={courseCtId}
          courseId={courseId}
        />
      )}
    </li>
  );
}
function ModuleEditor({
  module,
  lessons,
  videos,
  quizzes,
  courseCtId,
  courseId,
}: {
  module: Module;
  lessons: Lesson[];
  videos: LessonVideo[];
  quizzes: Quiz[];
  courseCtId: number | undefined;
  courseId: number;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [order, setOrder] = useState(module.order);
  const [isActive, setIsActive] = useState(module.is_active);
  const [description, setDescription] = useState(module.description ?? "");
  const [addingLesson, setAddingLesson] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState<Lesson["lesson_type"]>("video");
  const [lessonOrder, setLessonOrder] = useState(lessons.length + 1);
  const [lessonDuration, setLessonDuration] = useState(0);

  async function saveModule() {
    await updateModuleAction(module.id, {
      course: module.course,
      title,
      order,
      is_active: isActive,
      description,
    });
    location.reload();
  }

  async function addLesson() {
    if (!lessonTitle.trim()) return;
    const res = await createLessonAction({
      module: module.id,
      lesson_type: lessonType,
      title: lessonTitle.trim(),
      description: "",
      order: lessonOrder,
      is_active: true,
      duration_minutes: lessonDuration,
    });
    if (res.ok) location.reload();
  }

  return (
    <li className="rounded-lg border border-border bg-white p-3">
      <div className="flex items-start gap-2">
        {editing ? (
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass + " flex-1 min-w-[160px]"} />
            <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className={inputClass + " w-24"} />
            <select value={isActive ? "1" : "0"} onChange={(e) => setIsActive(e.target.value === "1")} className={inputClass + " w-24"}>
              <option value="1">Active</option>
              <option value="0">Draft</option>
            </select>
          </div>
        ) : (
          <div className="flex-1 text-sm font-medium text-foreground">
            <span className="mr-1.5 text-muted-foreground">{module.order}.</span>
            {module.title}
            <StatusDot status={module.is_active ? "active" : "draft"} />
          </div>
        )}
        {editing ? (
          <Button type="button" size="sm" variant="outline" onClick={saveModule}>
            Save
          </Button>
        ) : (
          <RowActions
            actions={[
              { icon: Pencil, label: "Edit module", onClick: () => setEditing(true) },
              {
                icon: Trash2,
                label: "Delete module",
                tone: "destructive",
                onClick: () => {
                  if (confirm(`Delete module "${module.title}"?`))
                    deleteModuleAction(module.id).then(() => location.reload());
                },
              },
            ]}
          />
        )}
      </div>
      {editing && (
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={textareaClass + " mt-2"}
        />
      )}
      <ul className="mt-2 space-y-1.5">
        {lessons.length === 0 && (
          <li className="text-xs text-muted-foreground">No lessons yet.</li>
        )}
        {lessons.map((l) => (
          <LessonRow
            key={l.id}
            lesson={l}
            videos={videos}
            quizzes={quizzes}
            courseCtId={courseCtId}
            courseId={courseId}
          />
        ))}
      </ul>
      {addingLesson ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            placeholder="Lesson title"
            className={inputClass + " flex-1 min-w-[160px]"}
          />
          <select value={lessonType} onChange={(e) => setLessonType(e.target.value as Lesson["lesson_type"])} className={inputClass + " w-28"}>
            <option value="video">Video</option>
            <option value="quiz">Quiz</option>
          </select>
          <input type="number" value={lessonOrder} onChange={(e) => setLessonOrder(Number(e.target.value))} className={inputClass + " w-20"} />
          <input type="number" value={lessonDuration} onChange={(e) => setLessonDuration(Number(e.target.value))} className={inputClass + " w-20"} />
          <Button type="button" size="sm" variant="outline" onClick={addLesson} disabled={!lessonTitle.trim()}>
            <Plus size={13} /> Add
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setAddingLesson(false)}>
            <X size={13} />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-2"
          onClick={() => {
            setLessonTitle("");
            setLessonOrder(lessons.length + 1);
            setAddingLesson(true);
          }}
        >
          <Plus size={13} /> Add lesson
        </Button>
      )}
    </li>
  );
}
// Nested curriculum editor for one course.
function CurriculumPanel({
  modules,
  lessons,
  videos,
  quizzes,
  contentTypes,
  courseId,
}: {
  modules: Module[];
  lessons: Lesson[];
  videos: LessonVideo[];
  quizzes: Quiz[];
  contentTypes: ContentTypeRow[];
  courseId: number;
}) {
  const courseModules = modules
    .filter((m) => m.course === courseId)
    .sort((a, b) => a.order - b.order);
  // ContentType of the Course model, used to write quiz polymorphic links.
  const courseCt = contentTypes.find((ct) => ct.model === "course");

  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleOrder, setModuleOrder] = useState(courseModules.length + 1);
  const [moduleActive, setModuleActive] = useState(true);

  async function addModule() {
    if (!moduleTitle.trim()) return;
    const res = await createModuleAction({
      course: courseId,
      title: moduleTitle.trim(),
      description: "",
      order: moduleOrder,
      is_active: moduleActive,
    });
    if (res.ok) location.reload();
  }

  return (
    <div className="rounded-lg border border-border bg-zinc-50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Curriculum
      </p>
      {courseModules.length === 0 && (
        <p className="mb-2 text-xs text-muted-foreground">
          No modules yet — add the first one below.
        </p>
      )}
      <ul className="space-y-2">
        {courseModules.map((m) => (
          <ModuleEditor
            key={m.id}
            module={m}
            lessons={lessons
              .filter((l) => l.module === m.id)
              .sort((a, b) => a.order - b.order)}
            videos={videos}
            quizzes={quizzes}
            courseCtId={courseCt?.id}
            courseId={courseId}
          />
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-border bg-white p-3">
        <input
          value={moduleTitle}
          onChange={(e) => setModuleTitle(e.target.value)}
          placeholder="Module title"
          className={inputClass + " flex-1 min-w-[160px]"}
        />
        <input
          type="number"
          value={moduleOrder}
          onChange={(e) => setModuleOrder(Number(e.target.value))}
          className={inputClass + " w-20"}
        />
        <select
          value={moduleActive ? "1" : "0"}
          onChange={(e) => setModuleActive(e.target.value === "1")}
          className={inputClass + " w-24"}
        >
          <option value="1">Active</option>
          <option value="0">Draft</option>
        </select>
        <Button type="button" size="sm" variant="outline" onClick={addModule} disabled={!moduleTitle.trim()}>
          <Plus size={13} /> Add module
        </Button>
      </div>
    </div>
  );
}
function CourseEditPanel({
  course,
  courseTypes,
  relatedByKind,
  modules,
  lessons,
  videos,
  quizzes,
  contentTypes,
}: {
  course: Course;
  courseTypes: CourseType[];
  relatedByKind: RelatedByKind;
  modules: Module[];
  lessons: Lesson[];
  videos: LessonVideo[];
  quizzes: Quiz[];
  contentTypes: ContentTypeRow[];
}) {
  const [fields, setFields] = useState<Course>(course);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof Course>(key: K, value: Course[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    await updateCourseAction(fields.id, {
      title: fields.title,
      subtitle: fields.subtitle,
      description: fields.description,
      language: fields.language,
      level: fields.level,
      is_active: fields.is_active,
      thumbnail: fields.thumbnail,
      instructor: fields.instructor,
      duration_minutes: fields.duration_minutes,
      rating: fields.rating,
      review_count: fields.review_count,
      price: fields.price,
      original_price: fields.original_price,
      cohort_label: fields.cohort_label,
      audience: fields.audience,
      downloadable_files_count: fields.downloadable_files_count,
      type: fields.type,
    });
    setSaving(false);
    location.reload();
  }

  return (
    <div className="mb-6 space-y-4 rounded-xl border border-border bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Edit course — {course.title}</p>
        <Button type="button" size="sm" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save course"}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Title">
          <input value={fields.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Instructor">
          <input value={fields.instructor ?? ""} onChange={(e) => set("instructor", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Category">
          <select
            value={fields.type ?? ""}
            onChange={(e) => set("type", e.target.value === "" ? null : Number(e.target.value))}
            className={inputClass}
          >
            <option value="">None</option>
            {courseTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Level">
          <select
            value={fields.level}
            onChange={(e) => set("level", e.target.value as Course["level"])}
            className={inputClass}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </Field>
        <Field label="Language">
          <input value={fields.language} onChange={(e) => set("language", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Duration (min)">
          <input type="number" value={fields.duration_minutes} onChange={(e) => set("duration_minutes", Number(e.target.value))} className={inputClass} />
        </Field>
        <Field label="Price">
          <input value={fields.price} onChange={(e) => set("price", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Original price">
          <input value={fields.original_price ?? ""} onChange={(e) => set("original_price", e.target.value || null)} className={inputClass} />
        </Field>
        <Field label="Rating">
          <input
            type="number"
            step="0.1"
            value={fields.rating ?? ""}
            onChange={(e) => set("rating", e.target.value === "" ? null : Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Review count">
          <input type="number" value={fields.review_count} onChange={(e) => set("review_count", Number(e.target.value))} className={inputClass} />
        </Field>
        <Field label="Downloadable files">
          <input type="number" value={fields.downloadable_files_count} onChange={(e) => set("downloadable_files_count", Number(e.target.value))} className={inputClass} />
        </Field>
        <Field label="Thumbnail URL">
          <input value={fields.thumbnail ?? ""} onChange={(e) => set("thumbnail", e.target.value || null)} className={inputClass} />
        </Field>
        <Field label="Cohort label">
          <input value={fields.cohort_label} onChange={(e) => set("cohort_label", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Subtitle">
          <input value={fields.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value || null)} className={inputClass} />
        </Field>
        <Field label="Active">
          <select
            value={fields.is_active ? "1" : "0"}
            onChange={(e) => set("is_active", e.target.value === "1")}
            className={inputClass}
          >
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </Field>
      </div>

      <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Course content
      </p>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {RELATED_ORDER.map((kind) => (
          <RelatedPanel
            key={kind}
            kind={kind}
            items={relatedByKind[kind]}
            courseId={course.id}
          />
        ))}
      </div>

      <CurriculumPanel
        modules={modules}
        lessons={lessons}
        videos={videos}
        quizzes={quizzes}
        contentTypes={contentTypes}
        courseId={course.id}
      />
    </div>
  );
}
export function CoursesManager({
  courses,
  courseTypes,
  relatedByKind,
  modules,
  lessons,
  videos,
  contentTypes,
  quizzes,
}: {
  courses: Course[];
  courseTypes: CourseType[];
  relatedByKind: RelatedByKind;
  modules: Module[];
  lessons: Lesson[];
  videos: LessonVideo[];
  contentTypes: ContentTypeRow[];
  quizzes: Quiz[];
}) {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  if (editingCourse) {
    return (
      <div className="space-y-4">
        <CourseEditPanel
          course={editingCourse}
          courseTypes={courseTypes}
          relatedByKind={relatedByKind}
          modules={modules}
          lessons={lessons}
          videos={videos}
          quizzes={quizzes}
          contentTypes={contentTypes}
        />
        <Button variant="outline" onClick={() => setEditingCourse(null)}>
          <X size={15} /> Close editor
        </Button>
      </div>
    );
  }

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
                label: "Edit course",
                onClick: () => setEditingCourse(course),
              },
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
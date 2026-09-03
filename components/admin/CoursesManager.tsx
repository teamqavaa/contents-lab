"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X, CheckCircle, AlertTriangle } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { RowActions } from "@/components/admin/RowActions";
import { StatusDot } from "@/components/admin/StatusDot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  createDjangoCourseAction,
  deleteDjangoCourseAction,
  fetchDjangoCourseRelatedDataAction,
  updateDjangoCourseAction,
} from "@/lib/admin-actions";
import type {
  DjangoCategory,
  DjangoCourse,
  DjangoCourseHighlight,
  DjangoCourseLearningPoint,
  DjangoCourseOutcome,
  DjangoLesson,
  DjangoModule,
  DjangoTag,
  DjangoTypeCourse,
  DjangoVideo,
} from "@/lib/api/courses-api";

import { StepIndicator } from "./courses/StepIndicator";
import { CourseTypeStep } from "./courses/CourseTypeStep";
import { CourseInfoStep, type CourseInfoValues } from "./courses/CourseInfoStep";
import { RelatedEntitiesStep } from "./courses/RelatedEntitiesStep";

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  all: "All levels",
};

const columns: DataColumn<DjangoCourse>[] = [
  {
    key: "title",
    header: "Title",
    render: (c) => (
      <div>
        <span className="font-medium">{c.title}</span>
        <span className="block text-xs text-muted-foreground">{c.slug}</span>
      </div>
    ),
  },
  {
    key: "category_details",
    header: "Category",
    render: (c) => (
      <span className="text-muted-foreground">
        {c.category_details?.name ?? "—"}
      </span>
    ),
  },
  {
    key: "level",
    header: "Level",
    render: (c) => <Badge variant="outline">{LEVEL_LABEL[c.level] ?? c.level}</Badge>,
  },
  {
    key: "language",
    header: "Lang",
    render: (c) => (
      <span className="text-muted-foreground uppercase">{c.language}</span>
    ),
  },
  {
    key: "price",
    header: "Price",
    sortValue: (c) => Number(c.price),
    render: (c) => (
      <span className="tabular-nums">
        {c.price}
        {Number(c.discount_price) > 0 && (
          <span className="ml-1 text-xs text-muted-foreground line-through">
            {c.discount_price}
          </span>
        )}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (c) => <StatusDot status={c.status === "published" ? "active" : "draft"} />,
  },
];

const initialCourseInfo: CourseInfoValues = {
  title: "",
  subtitle: "",
  description: "",
  category: "",
  language: "english",
  level: "all",
  status: "draft",
  price: "",
  discount_price: "0",
  tags: [],
  thumbnail: "",
  thumbnailFile: null,
  promo_video_url: "",
};

type CourseEditFields = {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  language: string;
  level: string;
  status: string;
  price: string;
  discount_price: string;
  thumbnail: string;
  promo_video_url: string;
};

export function CoursesManager({
  courses,
  courseTypes,
  categories,
  tags,
  outcomes,
  highlights,
  learningPoints,
  modules,
  lessons,
  videos,
}: {
  courses: DjangoCourse[];
  courseTypes: DjangoTypeCourse[];
  categories: DjangoCategory[];
  tags: DjangoTag[];
  outcomes: DjangoCourseOutcome[];
  highlights: DjangoCourseHighlight[];
  learningPoints: DjangoCourseLearningPoint[];
  modules: DjangoModule[];
  lessons: DjangoLesson[];
  videos: DjangoVideo[];
}) {
  const [step, setStep] = useState(0); // 0 = list, 1 = type, 2 = info, 3 = content
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [courseInfo, setCourseInfo] = useState<CourseInfoValues>(initialCourseInfo);
  const [createdCourse, setCreatedCourse] = useState<DjangoCourse | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<DjangoCourse | null>(null);
  const [editFields, setEditFields] = useState<CourseEditFields | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editThumbMode, setEditThumbMode] = useState<"link" | "upload">("link");
  const [editThumbFile, setEditThumbFile] = useState<File | null>(null);
  const [editThumbPreview, setEditThumbPreview] = useState<string | null>(null);

  // Step 3 related data (kept locally so newly added items show immediately)
  const [related, setRelated] = useState<{
    outcomes: DjangoCourseOutcome[];
    highlights: DjangoCourseHighlight[];
    learningPoints: DjangoCourseLearningPoint[];
    modules: DjangoModule[];
    lessons: DjangoLesson[];
    videos: DjangoVideo[];
  }>({ outcomes, highlights, learningPoints, modules, lessons, videos });

  async function refreshRelated() {
    const res = await fetchDjangoCourseRelatedDataAction();
    if (res.ok && res.data) {
      setRelated({
        outcomes: res.data.outcomes as DjangoCourseOutcome[],
        highlights: res.data.highlights as DjangoCourseHighlight[],
        learningPoints: res.data.learningPoints as DjangoCourseLearningPoint[],
        modules: res.data.modules as DjangoModule[],
        lessons: res.data.lessons as DjangoLesson[],
        videos: res.data.videos as DjangoVideo[],
      });
    }
  }

  function startNew() {
    setSelectedType(null);
    setCourseInfo(initialCourseInfo);
    setCreatedCourse(null);
    setCreateError(null);
    setStep(1);
  }

  async function handleCreateCourse(values: CourseInfoValues) {
    setCreating(true);
    setCreateError(null);

    if (createdCourse) {
      const res = await updateDjangoCourseAction(createdCourse.slug, {
        category: values.category,
        title: values.title.trim(),
        subtitle: values.subtitle.trim() || null,
        description: values.description.trim(),
        language: values.language,
        level: values.level,
        status: values.status,
        price: values.price || "0",
        discount_price: values.discount_price || "0",
        tags: values.tags,
        thumbnail: values.thumbnail.trim() || null,
        thumbnailFile: values.thumbnailFile ?? null,
        promo_video_url: values.promo_video_url.trim() || null,
      });
      setCreating(false);
      if (res.ok) {
        setStep(3);
      } else {
        setCreateError(res.error ?? "Failed to update course");
      }
      return;
    }

    const res = await createDjangoCourseAction({
      category: values.category,
      title: values.title.trim(),
      subtitle: values.subtitle.trim() || undefined,
      description: values.description.trim(),
      language: values.language,
      level: values.level,
      status: values.status,
      price: values.price || "0",
      discount_price: values.discount_price || "0",
      tags: values.tags,
      thumbnail: values.thumbnail.trim() || undefined,
      thumbnailFile: values.thumbnailFile ?? null,
      promo_video_url: values.promo_video_url.trim() || undefined,
    });
    setCreating(false);
    if (res.ok && res.data) {
      setCreatedCourse(res.data as unknown as DjangoCourse);
      setStep(3);
    } else {
      setCreateError(res.error ?? "Failed to create course");
    }
  }

  function finishWizard() {
    setStep(0);
    // Let the server component re-fetch by navigating.
    window.location.reload();
  }

  function confirmDeleteCourse(c: DjangoCourse) {
    if (!confirm(`Delete course "${c.title}"?`)) return;
    deleteDjangoCourseAction(c.slug).then(() => {
      window.location.reload();
    });
  }

  // ---- Editing panel (reuses Django Course fields) ----
  function openEditor(c: DjangoCourse) {
    setEditingCourse(c);
    setEditFields({
      title: c.title,
      subtitle: c.subtitle ?? "",
      description: c.description ?? "",
      category: c.category,
      language: c.language,
      level: c.level,
      status: c.status,
      price: c.price,
      discount_price: c.discount_price,
      thumbnail: c.thumbnail ?? "",
      promo_video_url: c.promo_video_url ?? "",
    });
    setEditThumbMode(c.thumbnail ? "link" : "upload");
    setEditThumbFile(null);
    setEditThumbPreview(null);
  }

  async function saveEdit() {
    if (!editingCourse || !editFields) return;
    setSavingEdit(true);
    const fields: Record<string, unknown> = {
      title: editFields.title ?? "",
      subtitle: editFields.subtitle ?? "",
      description: editFields.description ?? "",
      category: editFields.category ?? "",
      language: editFields.language ?? "english",
      level: editFields.level ?? "all",
      status: editFields.status ?? "draft",
      price: editFields.price ?? "0",
      discount_price: editFields.discount_price ?? "0",
      thumbnail: editFields.thumbnail ?? null,
      promo_video_url: editFields.promo_video_url ?? null,
    };
    await updateDjangoCourseAction(
      editingCourse.slug,
      fields,
      editThumbFile ?? null
    );
    setSavingEdit(false);
    window.location.reload();
  }

  // ===== RENDER =====

  // Wizard view
  if (step > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <StepIndicator current={step} />
          <Button variant="outline" size="sm" onClick={() => setStep(0)}>
            <X size={14} /> Cancel
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          {step === 1 && (
            <CourseTypeStep
              types={courseTypes}
              selectedId={selectedType}
              onSelect={setSelectedType}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <CourseInfoStep
              categories={categories}
              tags={tags}
              initial={courseInfo}
              onBack={() => setStep(1)}
              onNext={(values) => {
                setCourseInfo(values);
                handleCreateCourse(values);
              }}
            />
          )}

          {step === 3 && createdCourse && (
            <RelatedEntitiesStep
              course={createdCourse}
              outcomes={related.outcomes}
              highlights={related.highlights}
              learningPoints={related.learningPoints}
              modules={related.modules}
              lessons={related.lessons}
              videos={related.videos}
              onBack={() => setStep(2)}
              onFinish={finishWizard}
              onRefreshRelated={refreshRelated}
            />
          )}
        </div>

        {creating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle size={15} className="text-primary" /> Creating course…
          </div>
        )}
        {createError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>{createError}</span>
          </div>
        )}
      </div>
    );
  }

  // Editing panel
  if (editingCourse && editFields) {
    const f = editFields;
    const set = <K extends keyof CourseEditFields>(key: K, val: CourseEditFields[K]) =>
      setEditFields((p) => ({ ...(p as CourseEditFields), [key]: val }));

    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold">Edit course — {editingCourse.title}</p>
            <Button size="sm" onClick={saveEdit} disabled={savingEdit}>
              {savingEdit ? "Saving…" : "Save course"}
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Title">
              <input
                value={f.title ?? ""}
                onChange={(e) => set("title", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Subtitle">
              <input
                value={f.subtitle ?? ""}
                onChange={(e) => set("subtitle", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Category">
              <select
                value={f.category ?? ""}
                onChange={(e) => set("category", e.target.value)}
                className={inputClass}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Language">
              <select
                value={f.language ?? "english"}
                onChange={(e) => set("language", e.target.value)}
                className={inputClass}
              >
                <option value="english">English</option>
                <option value="french">French</option>
              </select>
            </Field>
            <Field label="Level">
              <select
                value={f.level ?? "all"}
                onChange={(e) => set("level", e.target.value)}
                className={inputClass}
              >
                <option value="all">All levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </Field>
            <Field label="Status">
              <select
                value={f.status ?? "draft"}
                onChange={(e) => set("status", e.target.value)}
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
            <Field label="Price">
              <input
                type="number"
                step="0.01"
                min="0"
                value={f.price ?? "0"}
                onChange={(e) => set("price", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Discount price">
              <input
                type="number"
                step="0.01"
                min="0"
                value={f.discount_price ?? "0"}
                onChange={(e) => set("discount_price", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Thumbnail">
              <div className="space-y-2">
                <div className="inline-flex rounded-md border border-input bg-muted p-0.5">
                  {(["upload", "link"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setEditThumbMode(m);
                        setEditThumbFile(null);
                        setEditThumbPreview(null);
                        if (m === "upload") set("thumbnail", "");
                      }}
                      className={`rounded px-3 py-1 text-xs font-medium transition ${
                        editThumbMode === m
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground"
                      }`}
                    >
                      {m === "upload" ? "Upload image" : "Image link"}
                    </button>
                  ))}
                </div>

                {editThumbMode === "link" ? (
                  <input
                    value={f.thumbnail ?? ""}
                    onChange={(e) => set("thumbnail", e.target.value)}
                    className={inputClass}
                  />
                ) : (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setEditThumbFile(file);
                        if (file) {
                          setEditThumbPreview(URL.createObjectURL(file));
                          set("thumbnail", "");
                        } else {
                          setEditThumbPreview(null);
                        }
                      }}
                      className="block w-full text-xs text-muted-foreground file:mr-3 file:h-9 file:rounded-md file:border-0 file:bg-muted file:px-3 file:text-sm file:text-foreground"
                    />
                    {editThumbPreview && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={editThumbPreview}
                        alt="Thumbnail preview"
                        className="h-24 w-full rounded-md border border-border object-cover"
                      />
                    )}
                  </div>
                )}
              </div>
            </Field>
            <Field label="Promo video URL">
              <input
                value={f.promo_video_url ?? ""}
                onChange={(e) => set("promo_video_url", e.target.value)}
                className={inputClass}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description">
                <textarea
                  rows={3}
                  value={f.description ?? ""}
                  onChange={(e) => set("description", e.target.value)}
                  className={textareaClass}
                />
              </Field>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => setEditingCourse(null)}>
          <X size={15} /> Close editor
        </Button>
      </div>
    );
  }

  // Course list
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">New course</p>
            <p className="text-xs text-muted-foreground">
              Create a course through a 3-step wizard.
            </p>
          </div>
          <Button size="sm" onClick={startNew}>
            <Plus size={15} /> New course
          </Button>
        </div>
      </div>

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
                onClick: () => openEditor(course),
              },
              {
                icon: Pencil,
                label: course.status === "published" ? "Set draft" : "Publish",
                onClick: () =>
                  updateDjangoCourseAction(course.slug, {
                    status: course.status === "published" ? "draft" : "published",
                  }).then(() => window.location.reload()),
              },
              {
                icon: Trash2,
                label: "Delete",
                tone: "destructive",
                onClick: () => confirmDeleteCourse(course),
              },
            ]}
          />
        )}
      />
    </div>
  );
}

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";
const textareaClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

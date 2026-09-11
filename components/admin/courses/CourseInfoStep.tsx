"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DjangoCategory, DjangoTag } from "@/lib/api/courses-api";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";
const textareaClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

function flattenCategories(
  cats: DjangoCategory[],
  prefix = ""
): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  for (const c of cats) {
    const label = prefix ? `${prefix} > ${c.name}` : c.name;
    if (c.is_active) out.push({ id: c.id, label });
    if (c.subcategories?.length) {
      out.push(...flattenCategories(c.subcategories, label));
    }
  }
  return out;
}

export type CourseInfoValues = {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  language: string;
  level: string;
  status: string;
  price: string;
  discount_price: string;
  tags: string[];
  thumbnail: string;
  promo_video_url: string;
  thumbnailFile?: File | null;
};

export function CourseInfoStep({
  categories,
  tags,
  initial,
  onBack,
  onNext,
}: {
  categories: DjangoCategory[];
  tags: DjangoTag[];
  initial: CourseInfoValues;
  onBack: () => void;
  onNext: (values: CourseInfoValues) => void;
}) {
  const [v, setV] = useState<CourseInfoValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [thumbMode, setThumbMode] = useState<"link" | "upload">(
    initial.thumbnail ? "link" : "upload"
  );
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);

  function set<K extends keyof CourseInfoValues>(k: K, val: CourseInfoValues[K]) {
    setV((p) => ({ ...p, [k]: val }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!v.title.trim()) e.title = "Title is required";
    if (v.title.length > 255) e.title = "Max 255 characters";
    if (!v.description.trim()) e.description = "Description is required";
    if (!v.category) e.category = "Category is required";
    if (!v.price || Number(v.price) < 0) e.price = "Valid price is required";
    if (v.discount_price && Number(v.discount_price) > Number(v.price)) {
      e.discount_price = "Must be less than or equal to price";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) onNext({ ...v, thumbnailFile: thumbFile });
  }

  function handleThumbFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setThumbFile(file);
    if (file) {
      setThumbPreview(URL.createObjectURL(file));
      set("thumbnail", "");
    } else {
      setThumbPreview(null);
    }
  }

  function switchThumbMode(mode: "link" | "upload") {
    setThumbMode(mode);
    if (mode === "upload") {
      setThumbFile(null);
      setThumbPreview(null);
      set("thumbnail", "");
    } else {
      setThumbFile(null);
      setThumbPreview(null);
    }
  }

  function toggleTag(tagId: string) {
    setV((p) => ({
      ...p,
      tags: p.tags.includes(tagId)
        ? p.tags.filter((t) => t !== tagId)
        : [...p.tags, tagId],
    }));
  }

  const flat = flattenCategories(categories);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold">Course information</h2>
        <p className="text-xs text-muted-foreground">
          Fill in the details for your course.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Title" required>
          <input
            value={v.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Intro to Django"
            maxLength={255}
            className={`${inputClass} ${errors.title ? "border-destructive" : ""}`}
          />
          {errors.title && (
            <p className="text-[11px] text-destructive">{errors.title}</p>
          )}
        </Field>

        <Field label="Subtitle">
          <input
            value={v.subtitle}
            onChange={(e) => set("subtitle", e.target.value)}
            placeholder="Build web apps from scratch"
            maxLength={255}
            className={inputClass}
          />
        </Field>

        <Field label="Category" required>
          <select
            value={v.category}
            onChange={(e) => set("category", e.target.value)}
            className={`${inputClass} ${errors.category ? "border-destructive" : ""}`}
          >
            <option value="">Select category</option>
            {flat.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-[11px] text-destructive">{errors.category}</p>
          )}
        </Field>

        <Field label="Language">
          <select
            value={v.language}
            onChange={(e) => set("language", e.target.value)}
            className={inputClass}
          >
            <option value="english">English</option>
            <option value="french">French</option>
          </select>
        </Field>

        <Field label="Level">
          <select
            value={v.level}
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
            value={v.status}
            onChange={(e) => set("status", e.target.value)}
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>

        <Field label="Price" required>
          <input
            type="number"
            step="0.01"
            min="0"
            value={v.price}
            onChange={(e) => set("price", e.target.value)}
            className={`${inputClass} ${errors.price ? "border-destructive" : ""}`}
          />
          {errors.price && (
            <p className="text-[11px] text-destructive">{errors.price}</p>
          )}
        </Field>

        <Field label="Discount price">
          <input
            type="number"
            step="0.01"
            min="0"
            value={v.discount_price}
            onChange={(e) => set("discount_price", e.target.value)}
            className={`${inputClass} ${errors.discount_price ? "border-destructive" : ""}`}
          />
          {errors.discount_price && (
            <p className="text-[11px] text-destructive">
              {errors.discount_price}
            </p>
          )}
        </Field>

        <Field label="Thumbnail">
          <div className="space-y-2">
            <div className="inline-flex rounded-md border border-input bg-muted p-0.5">
              {(["upload", "link"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchThumbMode(m)}
                  className={`rounded px-3 py-1 text-xs font-medium transition ${
                    thumbMode === m
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  {m === "upload" ? "Upload image" : "Image link"}
                </button>
              ))}
            </div>

            {thumbMode === "link" ? (
              <input
                value={v.thumbnail}
                onChange={(e) => set("thumbnail", e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            ) : (
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbFileChange}
                  className="block w-full text-xs text-muted-foreground file:mr-3 file:h-9 file:rounded-md file:border-0 file:bg-muted file:px-3 file:text-sm file:text-foreground"
                />
                {thumbPreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbPreview}
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
            value={v.promo_video_url}
            onChange={(e) => set("promo_video_url", e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Description" required>
            <textarea
              rows={3}
              value={v.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What students will learn in this course..."
              className={`${textareaClass} ${errors.description ? "border-destructive" : ""}`}
            />
            {errors.description && (
              <p className="text-[11px] text-destructive">
                {errors.description}
              </p>
            )}
          </Field>
        </div>

        {tags.length > 0 && (
          <div className="sm:col-span-2">
            <Field label="Tags">
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors ${
                      v.tags.includes(t.id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </Button>
        <Button type="button" size="sm" onClick={handleNext}>
          Next <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}

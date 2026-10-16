'use client';

import { useActionState } from 'react';
import { Loader2, Save } from 'lucide-react';

import type { CatalogCourse } from '@/actions/catalog';
import { saveCourseAction } from '@/actions/manageCourses';

export interface CategoryOption {
  id: string;
  label: string;
}

interface CourseFormProps {
  course?: CatalogCourse | null;
  categories: CategoryOption[];
  isAdmin: boolean;
}

export const inputClass =
  'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#6d5deb] focus:ring-2 focus:ring-[#6d5deb]/15';

function Field({ label, name, error, children, hint }: {
  label: string; name: string; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <label htmlFor={name} className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
      {label}
      {children}
      {hint && !error && <span className="text-xs font-normal text-neutral-400">{hint}</span>}
      {error && <span className="text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}

/** Formulaire de création / modification d'un cours (POST ou PATCH /api/courses/ via saveCourseAction). */
export default function CourseForm({ course, categories, isAdmin }: CourseFormProps) {
  const [state, formAction, pending] = useActionState(saveCourseAction, null);
  const errors = state?.errors ?? {};
  const statusOptions = isAdmin
    ? [['draft', 'Draft'], ['review', 'Pending review'], ['published', 'Published']]
    : [['draft', 'Draft'], ['review', 'Submit for review']];

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-2xl bg-white p-5 md:p-6">
      {course && <input type="hidden" name="slug" value={course.slug} />}

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Title *" name="title" error={errors.title}>
          <input id="title" name="title" required defaultValue={course?.title} className={inputClass} />
        </Field>
        <Field label="Subtitle" name="subtitle" error={errors.subtitle}>
          <input id="subtitle" name="subtitle" defaultValue={course?.subtitle} className={inputClass} />
        </Field>
      </div>

      <Field label="Description *" name="description" error={errors.description}>
        <textarea id="description" name="description" required rows={5} defaultValue={course?.description} className={inputClass} />
      </Field>

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Category *" name="category" error={errors.category}>
          <select id="category" name="category" required defaultValue={course?.category_details?.id ?? ''} className={inputClass}>
            <option value="" disabled>Choose a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Level" name="level" error={errors.level}>
          <select id="level" name="level" defaultValue={course?.level ?? 'beginner'} className={inputClass}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="all">All levels</option>
          </select>
        </Field>
        <Field label="Language" name="language" error={errors.language}>
          <select id="language" name="language" defaultValue={course?.language ?? 'english'} className={inputClass}>
            <option value="english">English</option>
            <option value="french">French</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Price *" name="price" error={errors.price}>
          <input id="price" name="price" type="number" min="0" step="0.01" required defaultValue={course?.price ?? ''} className={inputClass} />
        </Field>
        <Field label="Discounted price" name="discount_price" error={errors.discount_price} hint="0 = no discount">
          <input id="discount_price" name="discount_price" type="number" min="0" step="0.01" defaultValue={course?.discount_price ?? '0'} className={inputClass} />
        </Field>
        <Field label="Status" name="status" error={errors.status}>
          <select id="status" name="status" defaultValue={course?.status ?? 'draft'} className={inputClass}>
            {statusOptions.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
            {!isAdmin && course?.status === 'published' && <option value="published" disabled>Published</option>}
          </select>
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Thumbnail URL" name="thumbnail" error={errors.thumbnail} hint="Or upload an image">
          <input id="thumbnail" name="thumbnail" type="url" defaultValue={course?.thumbnail ?? ''} placeholder="https://…" className={inputClass} />
        </Field>
        <Field label="Upload a thumbnail" name="thumbnail_file">
          <input id="thumbnail_file" name="thumbnail_file" type="file" accept="image/*" className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-[#ece9fd] file:px-3 file:py-1 file:text-[#4f3fd6]`} />
        </Field>
      </div>

      <Field label="Promo video URL" name="promo_video_url" error={errors.promo_video_url}>
        <input id="promo_video_url" name="promo_video_url" type="url" defaultValue={course?.promo_video_url ?? ''} placeholder="https://www.youtube.com/watch?v=…" className={inputClass} />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-[#6d5deb] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5b4bd9] disabled:opacity-60"
        >
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {course ? 'Save changes' : 'Create course'}
        </button>
        {state && (
          <p role="status" className={`text-sm ${state.ok ? 'text-emerald-700' : 'text-red-600'}`}>{state.message}</p>
        )}
      </div>
    </form>
  );
}

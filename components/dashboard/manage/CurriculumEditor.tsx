'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ChevronDown, Loader2, Pencil, PlayCircle, Plus, Trash2 } from 'lucide-react';

import type { CatalogLesson, CatalogModule } from '@/actions/catalog';
import {
  deleteLessonAction,
  deleteModuleAction,
  saveLessonAction,
  saveModuleAction,
  type ActionResult,
} from '@/actions/manageCourses';
import { formatMinutes, plural } from '@/lib/format';
import { inputClass } from './CourseForm';

const smallButton =
  'inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50';
const primaryButton =
  'inline-flex items-center gap-1.5 rounded-lg bg-[#6d5deb] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#5b4bd9] disabled:opacity-60';

type Editing =
  | { kind: 'module'; id?: string }
  | { kind: 'lesson'; moduleId: string; id?: string }
  | null;

function nextOrder(items: { order: number }[]) {
  return items.reduce((max, item) => Math.max(max, item.order), 0) + 1;
}

/** Programme du cours : modules et leçons (avec leur vidéo), dans l'ordre affiché aux apprenants. */
export default function CurriculumEditor({ courseId, modules }: { courseId: string; modules: CatalogModule[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Editing>(null);
  const [message, setMessage] = useState<ActionResult | null>(null);
  const sorted = [...modules].sort((a, b) => a.order - b.order);

  const run = (action: () => Promise<ActionResult>) =>
    startTransition(async () => {
      const result = await action();
      setMessage(result);
      if (result.ok) {
        setEditing(null);
        router.refresh();
      }
    });

  const submitModule = (module: CatalogModule | undefined) => (formData: FormData) =>
    run(() =>
      saveModuleAction({
        id: module?.id,
        course: courseId,
        title: String(formData.get('title') || '').trim(),
        description: String(formData.get('description') || '').trim(),
        order: module?.order ?? nextOrder(sorted),
        is_published: formData.get('is_published') === 'on',
      }),
    );

  const submitLesson = (module: CatalogModule, lesson: CatalogLesson | undefined) => (formData: FormData) =>
    run(() =>
      saveLessonAction({
        id: lesson?.id,
        module: module.id,
        title: String(formData.get('title') || '').trim(),
        description: String(formData.get('description') || '').trim(),
        lesson_type: String(formData.get('lesson_type') || 'VIDEO'),
        duration_in_minutes: Number(formData.get('duration_in_minutes') || 0),
        order: lesson?.order ?? nextOrder(module.lessons || []),
        is_preview: formData.get('is_preview') === 'on',
        is_published: formData.get('is_published') === 'on',
        video_url: String(formData.get('video_url') || ''),
        video_id: lesson?.video?.id ?? null,
      }),
    );

  const confirmDelete = (label: string, action: () => Promise<ActionResult>) => {
    if (window.confirm(`Delete ${label}? This cannot be undone.`)) run(action);
  };

  const moduleForm = (module?: CatalogModule) => (
    <form action={submitModule(module)} className="flex flex-col gap-3 rounded-xl border border-[#d9d3fb] bg-[#faf9ff] p-4">
      <input name="title" required placeholder="Module title" defaultValue={module?.title} aria-label="Module title" className={inputClass} />
      <textarea name="description" rows={2} placeholder="What will learners achieve in this module?" defaultValue={module?.description} aria-label="Module description" className={inputClass} />
      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input type="checkbox" name="is_published" defaultChecked={module?.is_published ?? true} /> Visible to learners
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />} {module ? 'Save module' : 'Add module'}
        </button>
        <button type="button" onClick={() => setEditing(null)} className={smallButton}>Cancel</button>
      </div>
    </form>
  );

  const lessonForm = (module: CatalogModule, lesson?: CatalogLesson) => (
    <form action={submitLesson(module, lesson)} className="flex flex-col gap-3 rounded-xl border border-[#d9d3fb] bg-[#faf9ff] p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_160px_130px]">
        <input name="title" required placeholder="Lesson title" defaultValue={lesson?.title} aria-label="Lesson title" className={inputClass} />
        <select name="lesson_type" defaultValue={lesson?.lesson_type ?? 'VIDEO'} aria-label="Lesson type" className={inputClass}>
          <option value="VIDEO">Video</option>
          <option value="ARTICLE">Article</option>
          <option value="DOCUMENT">Document</option>
          <option value="QUIZ">Quiz</option>
        </select>
        <input name="duration_in_minutes" type="number" min="0" placeholder="Minutes" defaultValue={lesson?.duration_in_minutes ?? ''} aria-label="Duration in minutes" className={inputClass} />
      </div>
      <input name="video_url" type="url" placeholder="Video URL (YouTube, Vimeo…)" defaultValue={lesson?.video?.video_url ?? ''} aria-label="Video URL" className={inputClass} />
      <textarea name="description" rows={2} placeholder="Short summary" defaultValue={lesson?.description} aria-label="Lesson summary" className={inputClass} />
      <div className="flex flex-wrap gap-4 text-sm text-neutral-700">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_published" defaultChecked={lesson?.is_published ?? true} /> Visible to learners
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_preview" defaultChecked={lesson?.is_preview ?? false} /> Free preview
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />} {lesson ? 'Save lesson' : 'Add lesson'}
        </button>
        <button type="button" onClick={() => setEditing(null)} className={smallButton}>Cancel</button>
      </div>
    </form>
  );

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 md:p-6" aria-labelledby="curriculum-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="curriculum-title" className="text-lg font-bold text-neutral-900">Curriculum</h2>
          <p className="text-sm text-neutral-500">Modules are shown in this order on the learning path.</p>
        </div>
        <button type="button" onClick={() => setEditing({ kind: 'module' })} className={primaryButton}>
          <Plus className="w-3.5 h-3.5" /> Add module
        </button>
      </div>

      {message && (
        <p role="status" className={`text-sm ${message.ok ? 'text-emerald-700' : 'text-red-600'}`}>{message.message}</p>
      )}
      {editing?.kind === 'module' && !editing.id && moduleForm()}

      {sorted.length === 0 && editing?.kind !== 'module' && (
        <p className="rounded-xl bg-neutral-50 p-6 text-center text-sm text-neutral-500">
          No module yet. Add a first module, then its lessons.
        </p>
      )}

      <ol className="flex flex-col gap-3">
        {sorted.map((module, index) => {
          const lessons = [...(module.lessons || [])].sort((a, b) => a.order - b.order);
          return (
            <li key={module.id} className="rounded-xl border border-neutral-200">
              {editing?.kind === 'module' && editing.id === module.id ? (
                <div className="p-3">{moduleForm(module)}</div>
              ) : (
                <details open className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ece9fd] text-sm font-bold text-[#4f3fd6]">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-neutral-900">
                        {module.title}
                        {!module.is_published && <span className="ml-2 text-xs font-medium text-neutral-400">(hidden)</span>}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {plural(lessons.length, 'lesson')} · {formatMinutes(lessons.reduce((t, l) => t + (l.duration_in_minutes || 0), 0))}
                      </p>
                    </div>
                    <button type="button" className={smallButton} onClick={(e) => { e.preventDefault(); setEditing({ kind: 'module', id: module.id }); }}>
                      <Pencil className="w-3.5 h-3.5" /> <span className="sr-only md:not-sr-only">Edit</span>
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      className={`${smallButton} !text-red-600`}
                      onClick={(e) => { e.preventDefault(); confirmDelete(`the module "${module.title}" and its lessons`, () => deleteModuleAction(module.id)); }}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> <span className="sr-only">Delete module</span>
                    </button>
                    <ChevronDown className="w-4 h-4 text-neutral-400 transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>

                  <div className="flex flex-col gap-2 border-t border-neutral-100 p-4">
                    {lessons.map((lesson) =>
                      editing?.kind === 'lesson' && editing.id === lesson.id ? (
                        <div key={lesson.id}>{lessonForm(module, lesson)}</div>
                      ) : (
                        <div key={lesson.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-neutral-50">
                          <PlayCircle className={`w-4 h-4 shrink-0 ${lesson.video ? 'text-[#6d5deb]' : 'text-neutral-300'}`} aria-hidden="true" />
                          <span className="min-w-0 flex-1 truncate text-sm text-neutral-800">
                            {lesson.order}. {lesson.title}
                            {!lesson.is_published && <span className="ml-2 text-xs text-neutral-400">(hidden)</span>}
                            {lesson.is_preview && <span className="ml-2 text-xs text-emerald-700">preview</span>}
                            {!lesson.video && lesson.lesson_type === 'VIDEO' && <span className="ml-2 text-xs text-amber-700">no video</span>}
                          </span>
                          <span className="text-xs text-neutral-500">{formatMinutes(lesson.duration_in_minutes)}</span>
                          <button type="button" className={smallButton} onClick={() => setEditing({ kind: 'lesson', moduleId: module.id, id: lesson.id })}>
                            <Pencil className="w-3.5 h-3.5" /> <span className="sr-only">Edit lesson</span>
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            className={`${smallButton} !text-red-600`}
                            onClick={() => confirmDelete(`the lesson "${lesson.title}"`, () => deleteLessonAction(lesson.id))}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> <span className="sr-only">Delete lesson</span>
                          </button>
                        </div>
                      ),
                    )}
                    {editing?.kind === 'lesson' && editing.moduleId === module.id && !editing.id ? (
                      lessonForm(module)
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditing({ kind: 'lesson', moduleId: module.id })}
                        className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[#4f3fd6] hover:underline"
                      >
                        <Plus className="w-4 h-4" /> Add lesson
                      </button>
                    )}
                  </div>
                </details>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

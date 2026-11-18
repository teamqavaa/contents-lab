'use client';

import { useEffect, useRef, useState } from 'react';

import type { CatalogLesson } from '@/actions/catalog';
import { getLessonLabOptions, type LessonLabOption } from '@/actions/manageCourses';
import { inputClass } from './CourseForm';

/**
 * Champs du formulaire de leçon qui dépendent du type choisi dans le select `lesson_type` du même
 * formulaire (écouté via `input.form`, sans modifier le select existant) :
 * - ARTICLE / DOCUMENT : contenu texte (`content`) ;
 * - LAB : lab publié à rattacher (`lab`) ;
 * - QUIZ : rappel — le quiz s'édite depuis la liste des leçons (bouton Quiz).
 * Un champ non affiché n'est pas envoyé : les leçons vidéo restent enregistrées comme avant.
 */
export default function LessonTypeFields({ lesson }: { lesson?: CatalogLesson }) {
  const anchor = useRef<HTMLInputElement>(null);
  const [type, setType] = useState(lesson?.lesson_type ?? 'VIDEO');
  const [labs, setLabs] = useState<LessonLabOption[] | null>(null);

  useEffect(() => {
    const select = anchor.current?.form?.elements.namedItem('lesson_type');
    if (!(select instanceof HTMLSelectElement)) return;
    const onChange = () => setType(select.value);
    select.addEventListener('change', onChange);
    return () => select.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (type !== 'LAB' || labs !== null) return;
    let active = true;
    getLessonLabOptions().then((options) => {
      if (active) setLabs(options);
    });
    return () => {
      active = false;
    };
  }, [type, labs]);

  // Lab actuel conservé dans la liste même s'il n'est plus proposé (dépublié entre-temps)
  const current = lesson?.lab_details ?? null;
  const options = labs && current && !labs.some((lab) => lab.id === current.id) ? [current, ...labs] : labs;

  return (
    <>
      <input ref={anchor} type="hidden" data-lesson-type-fields="" />

      {(type === 'ARTICLE' || type === 'DOCUMENT') && (
        <textarea
          name="content"
          rows={8}
          placeholder="Lesson text shown to learners (plain text or Markdown)"
          defaultValue={lesson?.content ?? ''}
          aria-label="Lesson text"
          className={inputClass}
        />
      )}

      {type === 'LAB' && (
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Practice lab
          {options === null ? (
            <span className="text-xs text-neutral-500">Loading labs…</span>
          ) : (
            <select name="lab" required defaultValue={lesson?.lab ?? ''} aria-label="Practice lab" className={inputClass}>
              <option value="" disabled>
                {options.length ? 'Choose a published lab' : 'No published lab available'}
              </option>
              {options.map((lab) => (
                <option key={lab.id} value={lab.id}>
                  {lab.title} · {lab.language}
                </option>
              ))}
            </select>
          )}
          <span className="text-xs text-neutral-500">
            Learners open this lab from the lesson; completing it completes the lesson.
          </span>
        </label>
      )}

      {type === 'QUIZ' && (
        <p className="rounded-lg bg-[#ece9fd] px-3 py-2 text-xs text-[#4f3fd6]">
          {lesson?.quiz
            ? 'This lesson has a quiz: use “Quiz” in the lesson list to edit its questions.'
            : lesson
              ? 'Save the lesson, then use “Create quiz” in the lesson list to write its questions.'
              : 'Add the lesson first, then use “Create quiz” in the lesson list to write its questions.'}
        </p>
      )}
    </>
  );
}

'use client';

import Link from 'next/link';
import { CheckCircle2, FlaskConical, SkipForward } from 'lucide-react';

import { LANGUAGE_CONFIG, type Language } from '@/lib/lab/languages';

export interface LessonLab {
  id: string;
  slug: string;
  title: string;
  language: string;
}

interface LabLessonProps {
  lab: LessonLab | null;
  courseSlug: string;
  lessonId: string;
  completed: boolean;
  onNext?: () => void;
}

/**
 * Leçon LAB : le lab reste un objet autonome (/labs/<slug>). La leçon l'ouvre avec le cours et la leçon
 * en paramètres, pour afficher « Back to lesson » dans le lab. Réussir le lab termine la leçon côté
 * courses-api (signal activity_completed) : la progression est relue au retour dans le lecteur.
 */
export default function LabLesson({ lab, courseSlug, lessonId, completed, onNext }: LabLessonProps) {
  const language = lab ? LANGUAGE_CONFIG[lab.language as Language]?.label ?? lab.language : null;
  const href = lab
    ? `/labs/${encodeURIComponent(lab.slug)}?course=${encodeURIComponent(courseSlug)}&lesson=${encodeURIComponent(lessonId)}`
    : null;

  return (
    <div className="w-full bg-neutral-950 border-b border-neutral-800 shrink-0 flex justify-center">
      <div className="w-full max-w-3xl px-8 py-12 flex flex-col items-start gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
          <FlaskConical className="w-4 h-4" />
          <span>Practice lab{language ? ` · ${language}` : ''}</span>
        </div>
        {lab && href ? (
          <>
            <h2 className="text-2xl font-bold text-white">{lab.title}</h2>
            <p className="text-sm text-neutral-300 max-w-xl">
              Put this lesson into practice in the lab. Complete every step to finish this lesson automatically.
            </p>
            {completed && (
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Lab completed
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Link href={href} className="btn btn-primary">
                {completed ? 'Open the lab again' : 'Open the lab'}
              </Link>
              {completed && onNext && (
                <button type="button" onClick={onNext} className="btn btn-secondary">
                  Next lesson <SkipForward className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-neutral-400">This lab is not available yet.</p>
        )}
      </div>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ListChecks, Loader2, X } from 'lucide-react';

import type { CatalogLesson } from '@/actions/catalog';
import { getManagedQuiz, type ManagedQuiz } from '@/actions/manageQuizzes';
import QuizEditor from './QuizEditor';

/**
 * Bouton « Quiz » d'une leçon QUIZ dans l'éditeur de programme : ouvre l'éditeur du quiz rattaché, ou en
 * crée un et le rattache à la leçon. Fenêtre modale, hors du formulaire de leçon.
 */
export default function LessonQuizButton({ lesson }: { lesson: CatalogLesson }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<ManagedQuiz | null>(null);
  const [error, setError] = useState<string | null>(null);

  const show = async () => {
    setError(null);
    if (lesson.quiz) {
      setLoading(true);
      const loaded = await getManagedQuiz(lesson.quiz);
      setLoading(false);
      if (!loaded) {
        setError('This quiz could not be loaded.');
        return;
      }
      setQuiz(loaded);
    }
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <button type="button" className="btn btn-secondary btn-sm" onClick={show} disabled={loading}>
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ListChecks className="w-3.5 h-3.5" />}
        {lesson.quiz ? 'Quiz' : 'Create quiz'}
      </button>
      {error && <span role="alert" className="text-xs text-red-600">{error}</span>}

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={`Quiz of ${lesson.title}`}>
          <div className="my-8 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-neutral-900">Quiz · {lesson.title}</h2>
              <button type="button" onClick={close} className="btn btn-ghost btn-sm btn-icon" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <QuizEditor
              quiz={quiz}
              lessonId={lesson.id}
              lessonTitle={lesson.title}
              onSaved={(saved) => setQuiz(saved)}
              onCancel={close}
            />
          </div>
        </div>
      )}
    </>
  );
}

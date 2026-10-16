'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { CheckCircle2, Eye, Loader2, Pencil, Send, Trash2, Undo2 } from 'lucide-react';

import { deleteCourseAction, setCourseStatusAction, type CourseStatus } from '@/actions/manageCourses';

interface CourseActionsProps {
  slug: string;
  title: string;
  status: CourseStatus;
  isAdmin: boolean;
  /** Masque le lien « Edit » (déjà sur la page d'édition). */
  hideEdit?: boolean;
  /** Après suppression depuis l'éditeur : retour à la liste. */
  redirectAfterDelete?: string;
}

const button =
  'btn btn-secondary btn-sm';

/**
 * Actions sur un cours : modifier, changer de statut, supprimer.
 * Instructeur : soumettre pour validation / repasser en brouillon. Administrateur : publier / dépublier.
 */
export default function CourseActions({ slug, title, status, isAdmin, hideEdit, redirectAfterDelete }: CourseActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const run = (action: () => Promise<{ ok: boolean; message: string }>, after?: () => void) =>
    startTransition(async () => {
      const result = await action();
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok) {
        after?.();
        router.refresh();
      }
    });

  const changeStatus = (next: CourseStatus) => run(() => setCourseStatusAction(slug, next));
  const remove = () => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    run(() => deleteCourseAction(slug), () => redirectAfterDelete && router.push(redirectAfterDelete));
  };

  return (
    <div className="flex flex-col items-start gap-1.5 md:items-end">
      <div className="flex flex-wrap items-center gap-1.5">
        {!hideEdit && (
          <Link href={`/dashboard/manage-courses/${slug}`} className={button}>
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
        )}
        {status === 'published' && (
          <Link href={`/courses/${slug}`} className={button} target="_blank">
            <Eye className="w-3.5 h-3.5" /> View
          </Link>
        )}

        {isAdmin ? (
          status === 'published' ? (
            <button type="button" className={button} disabled={pending} onClick={() => changeStatus('draft')}>
              <Undo2 className="w-3.5 h-3.5" /> Move to draft
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => changeStatus('published')}
              className={`${button} !border-emerald-600 !bg-emerald-600 !text-white hover:!bg-emerald-700`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> {status === 'review' ? 'Validate & publish' : 'Publish'}
            </button>
          )
        ) : status === 'draft' ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => changeStatus('review')}
            className={`${button} !border-[#6d5deb] !bg-[#6d5deb] !text-white hover:!bg-[#5b4bd9]`}
          >
            <Send className="w-3.5 h-3.5" /> Submit for review
          </button>
        ) : status === 'review' ? (
          <button type="button" className={button} disabled={pending} onClick={() => changeStatus('draft')}>
            <Undo2 className="w-3.5 h-3.5" /> Back to draft
          </button>
        ) : null}

        <button type="button" disabled={pending} onClick={remove} className={`${button} !text-red-600 hover:!bg-red-50`}>
          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Delete
        </button>
      </div>
      {message && (
        <p role="status" className={`text-xs ${message.ok ? 'text-emerald-700' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}

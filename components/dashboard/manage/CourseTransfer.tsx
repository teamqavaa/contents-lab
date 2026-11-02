'use client';

import { useActionState, useRef } from 'react';
import { Download, Loader2, Upload } from 'lucide-react';

import { importCoursesAction, type ImportResult } from '@/actions/courseTransfer';

/**
 * Boutons d'import / export des cours et de leurs tables liées (administrateurs), à côté de « Add course ».
 * Export : liens de téléchargement vers /api/courses/export (Excel = une feuille par table,
 * CSV = .zip d'un fichier par table). Import : le choix du fichier envoie directement le formulaire.
 */
export default function CourseTransfer() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, formAction, pending] = useActionState<ImportResult | null, FormData>(importCoursesAction, null);

  return (
    <div className="flex flex-col items-stretch gap-2 md:items-end">
      <div className="flex flex-wrap gap-2">
        <a href="/api/courses/export?format=xlsx" download className="btn btn-secondary" title="One sheet per table">
          <Download className="w-4 h-4" aria-hidden="true" /> Export Excel
        </a>
        <a href="/api/courses/export?format=csv" download className="btn btn-secondary" title="ZIP archive with one CSV file per table">
          <Download className="w-4 h-4" aria-hidden="true" /> Export CSV
        </a>
        <form ref={formRef} action={formAction}>
          <input
            ref={inputRef}
            type="file"
            name="file"
            accept=".xlsx,.zip,.csv"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              if (event.currentTarget.files?.length) formRef.current?.requestSubmit();
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = '';
              inputRef.current?.click();
            }}
            disabled={pending}
            className="btn btn-secondary"
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Upload className="w-4 h-4" aria-hidden="true" />}
            {pending ? 'Importing…' : 'Import'}
          </button>
        </form>
      </div>

      {result && !pending && (
        <div
          role="status"
          className={`max-w-md rounded-xl px-4 py-3 text-sm ${
            result.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
          }`}
        >
          <p className="font-semibold">{result.message}</p>
          {result.details && result.details.length > 0 && (
            <ul className="mt-1 text-xs opacity-80">
              {result.details.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
          {result.failures && result.failures.length > 0 && (
            <ul className="mt-2 flex max-h-48 flex-col gap-1 overflow-y-auto text-xs text-red-700">
              {result.failures.map((failure) => (
                <li key={`${failure.table}-${failure.line}`}>
                  {failure.sheet}, line {failure.line} · {failure.label} — {failure.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

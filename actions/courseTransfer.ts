'use server';

import { revalidatePath } from 'next/cache';

import { getConnectedUser } from '@/actions/user';
import { ACCEPTED_EXTENSIONS, TABLES, readCourseFile } from '@/lib/courseSpreadsheet';
import { importWorkbook, type ImportFailure } from '@/lib/courseTransfer';
import { isAdmin } from '@/lib/roles';

export interface ImportResult {
  ok: boolean;
  message: string;
  /** Une ligne par table importée, ex. « Lessons: 3 created, 12 updated » */
  details?: string[];
  failures?: (ImportFailure & { sheet: string })[];
}

/**
 * Import d'un fichier .xlsx (une feuille par table), .zip de CSV ou .csv seul (administrateurs).
 * L'export est la route /api/courses/export.
 */
export async function importCoursesAction(_: ImportResult | null, formData: FormData): Promise<ImportResult> {
  if (!isAdmin(await getConnectedUser())) {
    return { ok: false, message: 'Only administrators can import courses.' };
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: `Choose a ${ACCEPTED_EXTENSIONS.join(', ')} file to import.` };
  }

  try {
    const parsed = await readCourseFile(file);
    const tables = Object.values(parsed).filter((table) => table.rows.length > 0);
    if (tables.length === 0) {
      return { ok: false, message: 'No data found. Export the courses first to get a template with the expected sheets and columns.' };
    }

    const { counts, failures } = await importWorkbook(parsed);
    revalidatePath('/dashboard/manage-courses', 'layout');

    const created = counts.reduce((sum, count) => sum + count.created, 0);
    const updated = counts.reduce((sum, count) => sum + count.updated, 0);
    const parts = [`${created} created`, `${updated} updated`];
    if (failures.length) parts.push(`${failures.length} failed`);

    return {
      ok: failures.length === 0,
      message: `Import finished: ${parts.join(', ')}.`,
      details: counts.map((count) => `${TABLES[count.table].sheet}: ${count.created} created, ${count.updated} updated`),
      failures: failures.map((failure) => ({ ...failure, sheet: TABLES[failure.table].sheet })),
    };
  } catch (error) {
    console.error('Import des cours :', error);
    return { ok: false, message: error instanceof Error ? error.message : 'The import failed.' };
  }
}

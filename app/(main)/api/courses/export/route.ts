// GET /api/courses/export?format=xlsx|csv — téléchargement des cours et de leurs tables liées (administrateurs).
// xlsx : une feuille par table ; csv : archive .zip avec un fichier <table>.csv par table.
import { getConnectedUser } from '@/actions/user';
import { buildCsvZip, buildXlsx } from '@/lib/courseSpreadsheet';
import { collectWorkbook } from '@/lib/courseTransfer';
import { isAdmin } from '@/lib/roles';

export async function GET(request: Request) {
  const user = await getConnectedUser();
  if (!isAdmin(user)) {
    return Response.json({ detail: 'Only administrators can export courses.' }, { status: 403 });
  }

  const format = new URL(request.url).searchParams.get('format') === 'csv' ? 'csv' : 'xlsx';

  let workbook;
  try {
    workbook = await collectWorkbook();
  } catch (error) {
    console.error('Export des cours :', error);
    const message = error instanceof Error ? error.message : 'The export failed.';
    return Response.json({ detail: message }, { status: 502 });
  }

  const date = new Date().toISOString().slice(0, 10);
  const xlsx = format === 'xlsx';
  const fileName = `ignite-courses-${date}.${xlsx ? 'xlsx' : 'zip'}`;
  return new Response(xlsx ? await buildXlsx(workbook) : await buildCsvZip(workbook), {
    headers: {
      'Content-Type': xlsx ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/zip',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-store',
    },
  });
}

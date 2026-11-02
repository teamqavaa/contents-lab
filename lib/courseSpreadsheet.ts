// lib/courseSpreadsheet.ts — format des fichiers d'import / export des cours et de leurs tables liées.
// Excel : une feuille par table. CSV : une archive .zip avec un fichier <table>.csv par table
// (un .csv seul est aussi accepté à l'import : son nom, ex. lessons.csv, indique la table).
// Utilisé côté serveur uniquement (route d'export et server action d'import).
import ExcelJS from 'exceljs';
import JSZip from 'jszip';

interface Column {
  key: string;
  /** false = informative (export seulement), ignorée à l'import */
  editable: boolean;
  width: number;
}

const col = (key: string, width = 16, editable = true): Column => ({ key, editable, width });

/** Tables dans l'ordre d'import : une table ne référence que des tables qui la précèdent. */
export const TABLES = {
  courses: {
    sheet: 'Courses',
    columns: [
      col('slug', 28), col('title', 40), col('subtitle', 40), col('description', 60), col('category', 24),
      col('tags', 30), col('level', 14), col('language', 12), col('price', 10), col('discount_price', 14),
      col('status', 12), col('thumbnail', 40), col('promo_video_url', 40), col('prerequisites', 40),
      col('target_audience', 40), col('author_email', 28, false), col('students', 10, false), col('updated_at', 22, false),
    ],
  },
  modules: {
    sheet: 'Modules',
    columns: [
      col('id', 38), col('course_slug', 28), col('title', 40), col('description', 50), col('order', 8),
      col('is_published', 12), col('is_free', 10), col('lessons', 10, false),
    ],
  },
  lessons: {
    sheet: 'Lessons',
    columns: [
      col('id', 38), col('course_slug', 28), col('module_id', 38), col('module_title', 32), col('title', 40),
      col('description', 50), col('lesson_type', 12), col('duration_in_minutes', 18), col('order', 8),
      col('is_preview', 10), col('is_published', 12), col('video_url', 40), col('video_provider', 14),
    ],
  },
  highlights: {
    sheet: 'Highlights',
    columns: [col('id', 38), col('course_slug', 28), col('title', 40), col('description', 50), col('icon', 14), col('order', 8), col('is_published', 12)],
  },
  learning_points: {
    sheet: 'Learning points',
    columns: [col('id', 38), col('course_slug', 28), col('title', 40), col('description', 50), col('icon', 14), col('order', 8), col('is_published', 12)],
  },
  outcomes: {
    sheet: 'Outcomes',
    columns: [
      col('id', 38), col('course_slug', 28), col('description', 50), col('category', 14), col('icon', 14),
      col('order', 8), col('is_highlighted', 14), col('is_published', 12),
    ],
  },
  resources: {
    sheet: 'Resources',
    columns: [
      col('id', 38), col('course_slug', 28), col('module_id', 38), col('module_title', 32), col('lesson_id', 38),
      col('lesson_title', 32), col('title', 40), col('description', 50), col('resource_type', 16), col('external_url', 40),
      col('file', 40, false), col('is_preview_allowed', 18), col('is_published', 12),
    ],
  },
  discounts: {
    sheet: 'Discounts',
    columns: [
      col('id', 38), col('code', 18), col('discount_percentage', 18), col('course_slug', 28), col('active', 10),
      col('valid_from', 24), col('valid_to', 24), col('max_uses', 10), col('used_count', 12, false),
    ],
  },
} satisfies Record<string, { sheet: string; columns: Column[] }>;

export type TableKey = keyof typeof TABLES;
export const TABLE_KEYS = Object.keys(TABLES) as TableKey[];

export type Row = Record<string, string>;
export type Workbook = Record<TableKey, Row[]>;

export interface ParsedTable {
  /** Colonnes modifiables présentes dans l'en-tête */
  columns: Set<string>;
  rows: { line: number; values: Row }[];
}
export type ParsedWorkbook = Partial<Record<TableKey, ParsedTable>>;

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/**
 * Une cellule commençant par = + - @ serait interprétée comme une formule par Excel
 * (injection de formule) : on la préfixe d'une apostrophe, retirée à l'import.
 */
function protectCsvCell(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function csvEscape(value: string): string {
  return /[",\r\n;]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function buildCsv(table: TableKey, rows: Row[]): string {
  const columns = TABLES[table].columns;
  const lines = [columns.map((column) => column.key).join(',')];
  for (const row of rows) {
    lines.push(columns.map((column) => csvEscape(protectCsvCell(row[column.key] ?? ''))).join(','));
  }
  // BOM : Excel ouvre ainsi le fichier en UTF-8 (accents)
  return `﻿${lines.join('\r\n')}\r\n`;
}

/** Archive .zip : un fichier <table>.csv par table. */
export async function buildCsvZip(workbook: Workbook): Promise<ArrayBuffer> {
  const zip = new JSZip();
  for (const table of TABLE_KEYS) zip.file(`${table}.csv`, buildCsv(table, workbook[table]));
  return zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' });
}

export async function buildXlsx(workbook: Workbook): Promise<ArrayBuffer> {
  const book = new ExcelJS.Workbook();
  book.creator = 'Ignite';
  for (const table of TABLE_KEYS) {
    const sheet = book.addWorksheet(TABLES[table].sheet, { views: [{ state: 'frozen', ySplit: 1 }] });
    sheet.columns = TABLES[table].columns.map((column) => ({ header: column.key, key: column.key, width: column.width }));
    sheet.getRow(1).font = { bold: true };
    // Les cellules sont écrites comme du texte : pas de formule possible dans un .xlsx généré ainsi
    workbook[table].forEach((row) => sheet.addRow(row));
  }
  return (await book.xlsx.writeBuffer()) as ArrayBuffer;
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

/** Analyse un CSV (RFC 4180 : guillemets, retours à la ligne dans une cellule). Séparateur , ou ;. */
function parseCsv(text: string): string[][] {
  const content = text.replace(/^﻿/, '');
  const firstLine = content.split(/\r?\n/, 1)[0] ?? '';
  // Excel en français enregistre les CSV avec « ; »
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (quoted) {
      if (char === '"' && content[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && content[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/** En-tête + lignes → table indexée par colonne (insensible à la casse), lignes vides ignorées. */
function toTable(table: TableKey, grid: string[][]): ParsedTable {
  const [header, ...body] = grid;
  if (!header) return { columns: new Set(), rows: [] };

  const editable = new Set<string>(TABLES[table].columns.filter((c) => c.editable).map((c) => c.key));
  const keys = header.map((name) => {
    const key = name.trim().toLowerCase();
    return editable.has(key) ? key : null;
  });

  const rows = body
    .map((cells, index) => {
      const values: Row = {};
      keys.forEach((key, i) => {
        if (!key) return;
        let value = (cells[i] ?? '').trim();
        // Apostrophe ajoutée à l'export (voir protectCsvCell)
        if (/^'[=+\-@]/.test(value)) value = value.slice(1);
        values[key] = value;
      });
      // +2 : ligne 1 = en-tête, numérotation à partir de 1 comme dans Excel
      return { line: index + 2, values };
    })
    .filter(({ values }) => Object.values(values).some((value) => value));

  return { columns: new Set(keys.filter((key): key is string => key !== null)), rows };
}

/** Nom de feuille ou de fichier (« Learning points », learning_points.csv…) → table. */
function tableFromName(name: string): TableKey | null {
  const normalized = name.replace(/^.*\//, '').replace(/\.csv$/i, '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  return TABLE_KEYS.find((key) => key === normalized || TABLES[key].sheet.toLowerCase().replace(/\s+/g, '_') === normalized) ?? null;
}

async function readXlsx(buffer: ArrayBuffer): Promise<ParsedWorkbook> {
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(buffer);
  const result: ParsedWorkbook = {};
  book.worksheets.forEach((sheet, index) => {
    // Une seule feuille au nom inconnu : la table des cours (ancien format)
    const table = tableFromName(sheet.name) ?? (index === 0 && book.worksheets.length === 1 ? 'courses' : null);
    if (!table) return;
    const grid: string[][] = [];
    sheet.eachRow({ includeEmpty: false }, (row) => {
      const values: string[] = [];
      // `text` : valeur affichée (gère texte enrichi, liens, nombres, résultats de formules)
      for (let c = 1; c <= sheet.columnCount; c++) values.push(row.getCell(c).text ?? '');
      grid.push(values);
    });
    result[table] = toTable(table, grid);
  });
  return result;
}

async function readZip(buffer: ArrayBuffer): Promise<ParsedWorkbook> {
  const zip = await JSZip.loadAsync(buffer);
  const result: ParsedWorkbook = {};
  for (const entry of Object.values(zip.files)) {
    if (entry.dir || !/\.csv$/i.test(entry.name) || entry.name.includes('__MACOSX')) continue;
    const table = tableFromName(entry.name);
    if (table) result[table] = toTable(table, parseCsv(await entry.async('string')));
  }
  return result;
}

export const ACCEPTED_EXTENSIONS = ['.xlsx', '.zip', '.csv'];

/** Lit un fichier importé : .xlsx (une feuille par table), .zip de CSV, ou un .csv seul. */
export async function readCourseFile(file: File): Promise<ParsedWorkbook> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xlsx')) return readXlsx(await file.arrayBuffer());
  if (name.endsWith('.zip')) return readZip(await file.arrayBuffer());
  if (name.endsWith('.csv')) {
    // Un .csv seul : la table vient du nom du fichier, sinon ce sont des cours
    const table = tableFromName(name) ?? 'courses';
    return { [table]: toTable(table, parseCsv(await file.text())) };
  }
  throw new Error(`Unsupported file type: use a ${ACCEPTED_EXTENSIONS.join(', ')} file.`);
}

"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { importCoursesAction } from "@/lib/admin-actions";
import { parseCsv, stringifyCsv } from "@/lib/csv";

// Import accepts a superset of these columns; unknown columns are ignored.
const COLUMNS = [
  "title",
  "subtitle",
  "description",
  "type",
  "language",
  "level",
  "is_active",
  "thumbnail",
  "instructor",
  "duration_minutes",
  "price",
  "original_price",
  "cohort_label",
  "audience",
  "downloadable_files_count",
  "rating",
  "review_count",
  "slug",
] as const;

const LEVELS = ["beginner", "intermediate", "advanced"] as const;

const TEMPLATE_ROWS = [
  COLUMNS,
  [
    "Intro to Git",
    "Basics for new developers",
    "Learn staging and committed changes",
    "Developer tools",
    "en",
    "beginner",
    "true",
    "https://example.com/git.jpg",
    "Amina Diallo",
    "90",
    "19.99",
    "29.99",
    "Only 10 seats left",
    "Anyone new to Git",
    "4",
    "4.6",
    "12",
    "",
  ],
  [
    "Sea Navigation Basics",
    "First steps with charts",
    "",
    "Maritime",
    "en",
    "beginner",
    "false",
    "",
    "Sara Kane",
    "60",
    "0",
    "",
    "",
    "Entry-level sailors",
    "6",
    "4.2",
    "8",
    "",
  ],
];

// Columns shown in the preview table; keeps the dialog narrow.
const PREVIEW_COLUMNS = [
  "title",
  "instructor",
  "level",
  "language",
  "duration_minutes",
  "price",
  "is_active",
] as const;

type RowError = { row: number; field: string; message: string };

type DialogState =
  | { step: "idle" }
  | { step: "ready"; rows: Record<string, unknown>[]; count: number; errors: RowError[] }
  | { step: "busy" }
  | {
      step: "done";
      ok: boolean;
      created: number;
      updated: number;
      errors: RowError[];
      error?: string;
    };

// Django's slugify shape for text; exact server output is the authority, this
// only catches duplicates before the request is sent.
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseBool(
  value: string,
  field: string,
  fallback: boolean,
  errors: RowError[],
  rowNumber: number
): boolean | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === "") return fallback;
  if (normalized === "true" || normalized === "1") return true;
  if (normalized === "false" || normalized === "0") return false;
  errors.push({ row: rowNumber, field, message: `${field} must be true or false.` });
  return null;
}

function parseNumber(
  value: string,
  field: string,
  errors: RowError[],
  rowNumber: number
): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    errors.push({ row: rowNumber, field, message: `${field} must be a number.` });
    return null;
  }
  return parsed;
}

// Turns raw parsed CSV rows into API payloads; validates what the server
// would reject anyway so the user sees problems before anything is sent.
function buildPayload(parsed: string[][]): {
  rows: Record<string, unknown>[];
  errors: RowError[];
} {
  const errors: RowError[] = [];
  if (parsed.length === 0) {
    errors.push({ row: 1, field: "file", message: "The file holds no rows." });
    return { rows: [], errors };
  }

  const headers = parsed[0].map((h) => h.trim());
  if (!headers.includes("title")) {
    errors.push({
      row: 1,
      field: "file",
      message: "The header row must contain a title column.",
    });
    return { rows: [], errors };
  }

  const column = (name: string) => headers.indexOf(name);
  const seen = new Map<string, number>();
  const rows: Record<string, unknown>[] = [];

  for (let i = 1; i < parsed.length; i++) {
    const cells = parsed[i];
    // Row numbers count the header line, so data starts at 2.
    const rowNumber = i + 1;
    if (cells.every((cell) => cell.trim() === "")) continue;

    const get = (name: string) => {
      const index = column(name);
      return index === -1 ? "" : (cells[index] ?? "").trim();
    };

    const title = get("title");
    if (title === "") {
      errors.push({ row: rowNumber, field: "title", message: "Title is required." });
    }

    const level = get("level") || "beginner";
    if (!(LEVELS as readonly string[]).includes(level)) {
      errors.push({
        row: rowNumber,
        field: "level",
        message: `Level must be one of: ${LEVELS.join(", ")}.`,
      });
    }

    const is_active = parseBool(get("is_active"), "is_active", false, errors, rowNumber);

    const duration = parseNumber(get("duration_minutes"), "duration_minutes", errors, rowNumber);
    if (duration !== null && !Number.isInteger(duration)) {
      errors.push({
        row: rowNumber,
        field: "duration_minutes",
        message: "duration_minutes must be a whole number.",
      });
    }
    const price = parseNumber(get("price"), "price", errors, rowNumber);
    const originalPrice = parseNumber(get("original_price"), "original_price", errors, rowNumber);
    const rating = parseNumber(get("rating"), "rating", errors, rowNumber);
    if (rating !== null && (rating < 0 || rating > 5)) {
      errors.push({
        row: rowNumber,
        field: "rating",
        message: "Rating must be between 0 and 5.",
      });
    }
    const reviewCount = parseNumber(get("review_count"), "review_count", errors, rowNumber);
    if (reviewCount !== null && !Number.isInteger(reviewCount)) {
      errors.push({
        row: rowNumber,
        field: "review_count",
        message: "review_count must be a whole number.",
      });
    }
    const downloads = parseNumber(
      get("downloadable_files_count"),
      "downloadable_files_count",
      errors,
      rowNumber
    );
    if (downloads !== null && !Number.isInteger(downloads)) {
      errors.push({
        row: rowNumber,
        field: "downloadable_files_count",
        message: "downloadable_files_count must be a whole number.",
      });
    }

    const slug = get("slug");
    const resolvedSlug = slugify(slug || title);
    if (resolvedSlug !== "") {
      const firstRow = seen.get(resolvedSlug);
      if (firstRow !== undefined) {
        errors.push({
          row: rowNumber,
          field: "slug",
          message: `Duplicate slug in file; first seen on row ${firstRow}.`,
        });
      } else {
        seen.set(resolvedSlug, rowNumber);
      }
    }

    const row: Record<string, unknown> = {
      title,
      language: get("language") || "en",
      level,
      is_active: is_active ?? false,
      instructor: get("instructor"),
      duration_minutes: duration ?? 0,
      price: price ?? 0,
      original_price: originalPrice ?? null,
      rating: rating ?? null,
      review_count: reviewCount ?? 0,
      downloadable_files_count: downloads ?? 0,
      thumbnail: get("thumbnail") || null,
      cohort_label: get("cohort_label"),
      audience: get("audience"),
    };
    for (const [name, pick] of [
      ["subtitle", get("subtitle")],
      ["description", get("description")],
      ["type", get("type")],
      ["slug", slug],
    ] as const) {
      if (pick) row[name] = pick;
    }
    rows.push(row);
  }

  return { rows, errors };
}

function downloadTemplate() {
  const blob = new Blob([stringifyCsv(TEMPLATE_ROWS)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "courses-template.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function ImportCoursesDialog() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<DialogState>({ step: "idle" });
  const [mode, setMode] = useState<"create" | "upsert">("create");
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setOpen(false);
    setState({ step: "idle" });
    setMode("create");
    if (fileRef.current) fileRef.current.value = "";
  };

  const onFile = async (file: File) => {
    const parsed = parseCsv(await file.text());
    const { rows, errors } = buildPayload(parsed);
    setState({ step: "ready", rows, count: rows.length, errors });
  };

  const runImport = async () => {
    if (state.step !== "ready" || state.errors.length > 0 || state.count === 0) return;
    setState({ step: "busy" });
    const result = await importCoursesAction(mode, state.rows);
    setState({
      step: "done",
      ok: result.ok,
      created: result.created,
      updated: result.updated,
      errors: result.errors ?? [],
      error: result.error,
    });
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Upload size={14} />
        Import CSV
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close import dialog"
            className="absolute inset-0 bg-zinc-950/50"
            onClick={reset}
          />
          <div className="relative z-10 w-full max-w-xl rounded-xl border bg-white p-5 shadow-lg">
            {state.step === "idle" && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-base font-semibold">Import courses from CSV</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    One course per row with a title column. Unknown columns are ignored.
                  </p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onFile(file);
                  }}
                  className="block w-full cursor-pointer rounded-lg border border-input bg-background p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
                />
                <div className="flex items-center justify-between">
                  <Button size="sm" variant="ghost" onClick={downloadTemplate}>
                    <Download size={14} />
                    Download template
                  </Button>
                  <Button size="sm" variant="ghost" onClick={reset}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {state.step === "ready" && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-base font-semibold">Preview import</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {state.count} course{state.count === 1 ? "" : "s"} found in the file.
                  </p>
                </div>

                {state.errors.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    <p className="mb-1 font-medium">Fix these rows before importing:</p>
                    <ul className="list-inside list-disc space-y-0.5">
                      {state.errors.slice(0, 20).map((e, i) => (
                        <li key={i}>
                          Row {e.row} ({e.field}): {e.message}
                        </li>
                      ))}
                    </ul>
                    {state.errors.length > 20 && <p>…and {state.errors.length - 20} more.</p>}
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto rounded-lg border">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-zinc-50">
                        <tr>
                          {PREVIEW_COLUMNS.map((c) => (
                            <th key={c} className="px-2 py-1.5 font-medium text-muted-foreground">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {state.rows.slice(0, 10).map((row, i) => (
                          <tr key={i} className="border-t">
                            {PREVIEW_COLUMNS.map((c) => (
                              <td key={c} className="px-2 py-1.5">
                                {String(row[c] ?? "—")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <fieldset className="flex gap-4 text-sm">
                  <legend className="sr-only">Import mode</legend>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="import-mode"
                      checked={mode === "create"}
                      onChange={() => setMode("create")}
                    />
                    Create only
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="import-mode"
                      checked={mode === "upsert"}
                      onChange={() => setMode("upsert")}
                    />
                    Create or update
                  </label>
                </fieldset>

                <div className="flex items-center justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={reset}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={state.errors.length > 0 || state.count === 0}
                    onClick={runImport}
                  >
                    Import {state.count} course{state.count === 1 ? "" : "s"}
                  </Button>
                </div>
              </div>
            )}

            {state.step === "busy" && (
              <p className="py-8 text-center text-sm text-muted-foreground">Importing…</p>
            )}

            {state.step === "done" && (
              <div className="flex flex-col gap-4">
                <h2 className="text-base font-semibold">
                  {state.ok ? "Import complete" : "Import failed"}
                </h2>
                {state.ok ? (
                  <p className="text-sm text-muted-foreground">
                    Created {state.created}, updated {state.updated}.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {state.error && <p className="mb-1">{state.error}</p>}
                    {state.errors.length > 0 && (
                      <ul className="list-inside list-disc space-y-0.5">
                        {state.errors.slice(0, 20).map((e, i) => (
                          <li key={i}>
                            Row {e.row} ({e.field}): {e.message}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                <div className="flex justify-end">
                  <Button size="sm" onClick={state.ok ? () => location.reload() : reset}>
                    {state.ok ? "Close and refresh" : "Back"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
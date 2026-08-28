"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { importUsersAction } from "@/lib/admin-actions";
import { parseCsv, stringifyCsv } from "@/lib/csv";

// Import accepts a superset of these columns; unknown columns are ignored.
const COLUMNS = [
  "full_name",
  "display_name",
  "email",
  "phone",
  "role",
  "is_active",
  "is_staff",
  "language",
  "password",
] as const;

const ROLES = ["student", "instructor", "admin", "parent"];

export { ROLES as USER_ROLES };

const TEMPLATE_ROWS = [
  COLUMNS,
  ["Amina Diallo", "Amina", "amina@example.com", "", "admin", "true", "true", "en", "S3curePass!"],
  ["John Doe", "", "", "+1234567890", "student", "true", "false", "en", ""],
];

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

function parseBool(
  value: string,
  field: "is_active" | "is_staff",
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
  if (!headers.includes("email") && !headers.includes("phone")) {
    errors.push({
      row: 1,
      field: "file",
      message: "The header row must contain an email and/or phone column.",
    });
    return { rows: [], errors };
  }

  const column = (name: string) => headers.indexOf(name);
  const seen = { email: new Map<string, number>(), phone: new Map<string, number>() };
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

    const is_active = parseBool(get("is_active"), "is_active", true, errors, rowNumber);
    const is_staff = parseBool(get("is_staff"), "is_staff", false, errors, rowNumber);

    const role = get("role") || "student";
    if (!ROLES.includes(role)) {
      errors.push({
        row: rowNumber,
        field: "role",
        message: `Role must be one of: ${ROLES.join(", ")}.`,
      });
    }

    const email = get("email") || null;
    const phone = get("phone") || null;
    if (!email && !phone) {
      errors.push({
        row: rowNumber,
        field: "email",
        message: "At least one of email or phone must be filled in.",
      });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ row: rowNumber, field: "email", message: "Not a valid email address." });
    }
    for (const [value, map, label] of [
      [email, seen.email, "email"],
      [phone, seen.phone, "phone"],
    ] as const) {
      if (!value) continue;
      const firstRow = map.get(value);
      if (firstRow !== undefined) {
        errors.push({
          row: rowNumber,
          field: label,
          message: `Duplicate ${label} in file; first seen on row ${firstRow}.`,
        });
      } else {
        map.set(value, rowNumber);
      }
    }

    const password = get("password");
    rows.push({
      full_name: get("full_name") || null,
      display_name: get("display_name") || null,
      email,
      phone,
      role,
      is_active,
      is_staff,
      language: get("language") || "en",
      ...(password ? { password } : {}),
    });
  }

  return { rows, errors };
}

function downloadTemplate() {
  const blob = new Blob([stringifyCsv(TEMPLATE_ROWS)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "users-template.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function ImportUsersDialog() {
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
    const result = await importUsersAction(mode, state.rows);
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
                  <h2 className="text-base font-semibold">Import users from CSV</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    At least one of email or phone per row. Unknown columns are ignored.
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
                    {state.count} user{state.count === 1 ? "" : "s"} found in the file.
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
                          {COLUMNS.filter((c) => c !== "password").map((c) => (
                            <th key={c} className="px-2 py-1.5 font-medium text-muted-foreground">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {state.rows.slice(0, 10).map((row, i) => (
                          <tr key={i} className="border-t">
                            {COLUMNS.filter((c) => c !== "password").map((c) => (
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
                    Import {state.count} user{state.count === 1 ? "" : "s"}
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


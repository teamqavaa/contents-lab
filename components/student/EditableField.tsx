"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";

type EditableFieldProps = {
  label: string;
  value: string | null;
  onSave: (
    newValue: string,
  ) => Promise<{ ok: boolean; message?: string }>;
};

export default function EditableField({
  label,
  value,
  onSave,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  // Track the prop the draft was seeded from, so an external value change
  // resets the field. React applies this during render; no effect needed.
  const [lastSeenValue, setLastSeenValue] = useState(value ?? "");
  const [draftValue, setDraftValue] = useState(value ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (lastSeenValue !== (value ?? "")) {
    setLastSeenValue(value ?? "");
    setDraftValue(value ?? "");
  }

  async function handleSave() {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await onSave(draftValue);

    setIsSaving(false);

    if (!result.ok) {
      setErrorMessage(result.message ?? `Unable to save ${label.toLowerCase()}.`);
      return;
    }

    setIsEditing(false);
    setSuccessMessage(result.message ?? "Saved successfully.");
  }

  function handleCancel() {
    setDraftValue(value ?? "");
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEditing(false);
  }

  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          {isEditing ? (
            <input
              autoFocus
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 transition focus:border-[#007bff]"
            />
          ) : (
            <p className="text-sm text-foreground">
              {value && value.trim().length > 0 ? (
                value
              ) : (
                <span className="italic text-muted-foreground">Not set</span>
              )}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#007bff] transition hover:bg-[#007bff]/10 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={`Save ${label}`}
              >
                <Check size={16} />
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={`Cancel editing ${label}`}
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setSuccessMessage(null);
                setIsEditing(true);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label={`Edit ${label}`}
            >
              <Pencil size={16} />
            </button>
          )}
        </div>
      </div>

      {isSaving ? (
        <p className="mt-2 text-xs text-muted-foreground">Saving...</p>
      ) : null}
      {errorMessage ? (
        <p className="mt-2 text-xs text-red-500">{errorMessage}</p>
      ) : null}
      {successMessage ? (
        <p className="mt-2 text-xs text-emerald-600">{successMessage}</p>
      ) : null}
    </div>
  );
}

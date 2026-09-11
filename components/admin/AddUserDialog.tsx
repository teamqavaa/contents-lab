"use client";

import { useState, type ReactNode } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createUserAction } from "@/lib/admin-actions";
import { USER_ROLES } from "@/components/admin/ImportUsersDialog";

type FormState = {
  full_name: string;
  display_name: string;
  email: string;
  phone: string;
  role: string;
  language: string;
  password: string;
  is_active: boolean;
  is_staff: boolean;
};

type DialogState =
  | { step: "idle" }
  | { step: "busy" }
  | { step: "done"; ok: boolean; error?: string };

const INITIAL: FormState = {
  full_name: "",
  display_name: "",
  email: "",
  phone: "",
  role: "student",
  language: "en",
  password: "",
  is_active: true,
  is_staff: false,
};

// Mirrors the CSV import rules so the user sees problems before anything is sent.
function validate(form: FormState): string | null {
  if (!form.email.trim() && !form.phone.trim()) {
    return "At least one of email or phone must be filled in.";
  }
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return "Not a valid email address.";
  }
  if (!USER_ROLES.includes(form.role)) {
    return `Role must be one of: ${USER_ROLES.join(", ")}.`;
  }
  return null;
}

function buildPayload(form: FormState) {
  const nullable = (value: string) => (value.trim() === "" ? null : value.trim());
  return {
    full_name: nullable(form.full_name),
    display_name: nullable(form.display_name),
    email: nullable(form.email),
    phone: nullable(form.phone),
    role: form.role,
    is_active: form.is_active,
    is_staff: form.is_staff,
    language: form.language.trim() || "en",
    ...(form.password ? { password: form.password } : {}),
  };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "rounded-lg border border-input bg-background px-3 py-1.5 text-sm";

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<DialogState>({ step: "idle" });

  const reset = () => {
    setOpen(false);
    setForm(INITIAL);
    setError(null);
    setState({ step: "idle" });
  };

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    const invalid = validate(form);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    setState({ step: "busy" });
    const result = await createUserAction(buildPayload(form));
    setState({ step: "done", ok: result.ok, error: result.error });
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <UserPlus size={14} />
        Add User
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close add user dialog"
            className="absolute inset-0 bg-zinc-950/50"
            onClick={reset}
          />
          <div className="relative z-10 w-full max-w-xl rounded-xl border bg-white p-5 shadow-lg">
            {state.step !== "done" && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-base font-semibold">Add a user</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    At least one of email or phone is required.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Full name">
                    <input
                      value={form.full_name}
                      onChange={(e) => set("full_name", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Display name">
                    <input
                      value={form.display_name}
                      onChange={(e) => set("display_name", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Role">
                    <select
                      value={form.role}
                      onChange={(e) => set("role", e.target.value)}
                      className={inputClass}
                    >
                      {USER_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Language">
                    <input
                      value={form.language}
                      onChange={(e) => set("language", e.target.value)}
                      placeholder="en"
                      className={inputClass}
                    />
                  </Field>
                  <div className="col-span-2">
                    <Field label="Password">
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Leave blank to create a user who cannot sign in yet.
                    </p>
                  </div>
                </div>

                <fieldset className="flex gap-4 text-sm">
                  <legend className="sr-only">Permissions</legend>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => set("is_active", e.target.checked)}
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={form.is_staff}
                      onChange={(e) => set("is_staff", e.target.checked)}
                    />
                    Staff
                  </label>
                </fieldset>

                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={reset}>
                    Cancel
                  </Button>
                  <Button size="sm" disabled={state.step === "busy"} onClick={submit}>
                    Add user
                  </Button>
                </div>
              </div>
            )}

            {state.step === "busy" && (
              <p className="py-8 text-center text-sm text-muted-foreground">Creating…</p>
            )}

            {state.step === "done" && (
              <div className="flex flex-col gap-4">
                <h2 className="text-base font-semibold">
                  {state.ok ? "User created" : "Could not create user"}
                </h2>
                {!state.ok && state.error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {state.error}
                  </p>
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
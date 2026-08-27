"use client";

import { useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { RowActions } from "@/components/admin/RowActions";
import { StatusDot } from "@/components/admin/StatusDot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  createLabAction,
  createObjectiveAction,
  deleteLabAction,
  deleteObjectiveAction,
  updateLabAction,
  updateObjectiveAction,
} from "@/lib/admin-actions";
import type { Lab, Skill } from "@/lib/api/lab-api";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";
const textareaClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

function columns(skillsById: Map<string, Skill>): DataColumn<Lab>[] {
  return [
    {
      key: "title",
      header: "Title",
      sortValue: (l) => l.title,
      render: (l) => <span className="font-medium">{l.title}</span>,
    },
    {
      key: "language",
      header: "Language",
      sortValue: (l) => l.language,
      render: (l) => <Badge variant="outline">{l.language}</Badge>,
    },
    {
      key: "difficulty",
      header: "Level",
      sortValue: (l) => l.difficulty,
      render: (l) => <Badge variant="outline">{l.difficulty}</Badge>,
    },
    {
      key: "skill",
      header: "Skill",
      render: (l) => (
        <span className="text-muted-foreground">
          {(l.skill && skillsById.get(l.skill)?.title) || "—"}
        </span>
      ),
    },
    {
      key: "objectives",
      header: "Steps",
      sortValue: (l) => l.objectives.length,
      render: (l) => <span className="text-muted-foreground">{l.objectives.length}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (l) => (
        <StatusDot status={l.status === "published" ? "published" : "draft"} />
      ),
    },
  ];
}

function LabForm({ skills }: { skills: Skill[] }) {
  return (
    <form
      action={(formData) => {
        createLabAction({ ok: false }, formData);
      }}
      className="space-y-3 rounded-xl border border-border bg-card p-4"
    >
      <p className="text-sm font-semibold">New lab</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-foreground">Title</label>
          <input name="title" required placeholder="Intro to Python Lists" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Language</label>
          <select name="language" defaultValue="python" className={inputClass}>
            <option value="python">Python</option>
            <option value="php">PHP</option>
            <option value="typescript">TypeScript</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Difficulty</label>
          <select name="difficulty" defaultValue="guided" className={inputClass}>
            <option value="guided">Guided</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Status</label>
          <select name="status" defaultValue="draft" className={inputClass}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Skill</label>
          <select name="skill" defaultValue="" className={inputClass}>
            <option value="">Uncategorized</option>
            {skills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-foreground">Description</label>
          <input name="description" placeholder="Short description" className={inputClass} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-foreground">Starter code</label>
          <textarea
            name="starter_code"
            rows={3}
            placeholder="Code the student begins with"
            className={textareaClass}
          />
        </div>
      </div>
      <Button type="submit">
        <Plus size={15} /> Create
      </Button>
    </form>
  );
}
// Per-lab step editor mirroring Django's LabObjectiveInline. A nested form
// creates an objective; each row can expand into a full edit form.
function ObjectivePanel({ lab }: { lab: Lab }) {
  const rows = [...lab.objectives].sort((a, b) => a.order - b.order);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-border bg-zinc-50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Steps / objectives
      </p>
      <ul className="space-y-2">
        {rows.length === 0 && (
          <li className="text-xs text-muted-foreground">No steps yet.</li>
        )}
        {rows.map((objective, idx) => (
          <li key={objective.id} className="rounded-md border border-border bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">
                <span className="mr-1.5 text-muted-foreground">{idx + 1}.</span>
                {objective.title}
              </span>
              <RowActions
                actions={[
                  {
                    icon: Pencil,
                    label: "Edit",
                    onClick: () => setEditingId(editingId === objective.id ? null : objective.id),
                  },
                  {
                    icon: Trash2,
                    label: "Delete",
                    tone: "destructive",
                    onClick: () => {
                      if (confirm(`Delete step "${objective.title}"?`)) {
                        deleteObjectiveAction(lab.id, objective.id).then(() => location.reload());
                      }
                    },
                  },
                ]}
              />
            </div>
            {editingId === objective.id && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  updateObjectiveAction(lab.id, objective.id, {
                    order: Number(new FormData(form).get("order") ?? 1),
                    title: String(new FormData(form).get("title") ?? ""),
                    content: String(new FormData(form).get("content") ?? ""),
                    hint: String(new FormData(form).get("hint") ?? "") || null,
                    starter_code: String(new FormData(form).get("starter_code") ?? ""),
                  }).then(() => location.reload());
                }}
                className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Order</label>
                  <input name="order" type="number" defaultValue={objective.order} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Title</label>
                  <input name="title" defaultValue={objective.title} className={inputClass} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-foreground">Content</label>
                  <textarea name="content" rows={2} defaultValue={objective.content} className={textareaClass} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-foreground">Hint</label>
                  <textarea name="hint" rows={2} defaultValue={objective.hint ?? ""} className={textareaClass} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-foreground">Starter code</label>
                  <textarea name="starter_code" rows={3} defaultValue={objective.starter_code} className={textareaClass} />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" size="sm">
                    <Save size={14} /> Save step
                  </Button>
                </div>
              </form>
            )}
          </li>
        ))}
      </ul>
      <ObjectiveAddForm labId={lab.id} nextOrder={rows.length + 1} />
    </div>
  );
}

function ObjectiveAddForm({ labId, nextOrder }: { labId: string; nextOrder: number }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        createObjectiveAction(labId, new FormData(form)).then(() => location.reload());
      }}
      className="mt-2 space-y-2 rounded-md border border-dashed border-border bg-white p-3"
    >
      <p className="text-xs font-semibold text-muted-foreground">Add step</p>
      <input type="hidden" name="order" value={nextOrder} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input name="title" required placeholder="Step title" className={inputClass} />
        <input name="content" placeholder="Instructions" className={inputClass} />
        <input name="hint" placeholder="Hint (optional)" className={inputClass} />
        <textarea name="starter_code" rows={2} placeholder="Starter code" className={textareaClass} />
      </div>
      <Button type="submit" size="sm" variant="outline">
        <Plus size={14} /> Add step
      </Button>
    </form>
  );
}
// Edit panel for an existing lab: editable base fields plus the step editor.
function LabEditPanel({ lab, skills }: { lab: Lab; skills: Skill[] }) {
  const [fields, setFields] = useState({
    title: lab.title,
    description: lab.description ?? "",
    language: lab.language,
    status: lab.status,
    difficulty: lab.difficulty,
    skill: lab.skill ?? "",
    starter_code: lab.starter_code ?? "",
  });
  const [saving, setSaving] = useState(false);

  function save() {
    setSaving(true);
    const form = new FormData();
    form.set("id", lab.id);
    form.set("title", fields.title);
    form.set("description", fields.description);
    form.set("language", fields.language);
    form.set("status", fields.status);
    form.set("difficulty", fields.difficulty);
    form.set("skill", fields.skill);
    form.set("starter_code", fields.starter_code);
    updateLabAction(form).then(() => {
      setSaving(false);
      location.reload();
    });
  }

  return (
    <div className="mb-6 space-y-4 rounded-xl border border-border bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Edit lab — {lab.title}</p>
        <Button type="button" size="sm" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save lab"}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Title</label>
          <input value={fields.title} onChange={(e) => setFields({ ...fields, title: e.target.value })} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Skill</label>
          <select
            value={fields.skill}
            onChange={(e) => setFields({ ...fields, skill: e.target.value })}
            className={inputClass}
          >
            <option value="">Uncategorized</option>
            {skills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Language</label>
          <select value={fields.language} onChange={(e) => setFields({ ...fields, language: e.target.value })} className={inputClass}>
            <option value="python">Python</option>
            <option value="php">PHP</option>
            <option value="typescript">TypeScript</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Difficulty</label>
          <select
            value={fields.difficulty}
            onChange={(e) => setFields({ ...fields, difficulty: e.target.value })}
            className={inputClass}
          >
            <option value="guided">Guided</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Status</label>
          <select value={fields.status} onChange={(e) => setFields({ ...fields, status: e.target.value })} className={inputClass}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-foreground">Description</label>
          <input value={fields.description} onChange={(e) => setFields({ ...fields, description: e.target.value })} className={inputClass} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-foreground">Starter code</label>
          <textarea
            value={fields.starter_code}
            onChange={(e) => setFields({ ...fields, starter_code: e.target.value })}
            rows={3}
            className={textareaClass}
          />
        </div>
      </div>
      <ObjectivePanel lab={lab} />
    </div>
  );
}

export function LabsManager({ labs, skills }: { labs: Lab[]; skills: Skill[] }) {
  const skillsById = new Map(skills.map((s) => [s.id, s]));
  const [editingLab, setEditingLab] = useState<Lab | null>(null);

  if (editingLab) {
    return (
      <div className="space-y-4">
        <LabEditPanel lab={editingLab} skills={skills} />
        <Button variant="outline" onClick={() => setEditingLab(null)}>
          <X size={15} /> Close editor
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LabForm skills={skills} />
      <DataTable
        rows={labs}
        rowKey={(l) => l.id}
        columns={columns(skillsById)}
        renderRowActions={(lab) => (
          <RowActions
            actions={[
              {
                icon: Pencil,
                label: "Edit lab",
                onClick: () => setEditingLab(lab),
              },
              {
                icon: Trash2,
                label: "Delete",
                tone: "destructive",
                onClick: () => {
                  if (confirm(`Delete "${lab.title}"?`)) {
                    deleteLabAction(lab.id).then(() => location.reload());
                  }
                },
              },
            ]}
          />
        )}
      />
    </div>
  );
}
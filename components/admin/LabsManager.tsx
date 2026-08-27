"use client";

import { useActionState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { RowActions } from "@/components/admin/RowActions";
import { StatusDot } from "@/components/admin/StatusDot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createLabAction, deleteLabAction } from "@/lib/admin-actions";
import type { Lab, Skill } from "@/lib/api/lab-api";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

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
  const [state, formAction, pending] = useActionState(createLabAction, { ok: false });

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-semibold">New lab</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="lab-title" className="text-xs font-medium text-foreground">Title</label>
          <input id="lab-title" name="title" required placeholder="Intro to Python Lists" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="lab-language" className="text-xs font-medium text-foreground">Language</label>
          <select id="lab-language" name="language" defaultValue="python" className={inputClass}>
            <option value="python">Python</option>
            <option value="php">PHP</option>
            <option value="typescript">TypeScript</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="lab-difficulty" className="text-xs font-medium text-foreground">Difficulty</label>
          <select id="lab-difficulty" name="difficulty" defaultValue="guided" className={inputClass}>
            <option value="guided">Guided</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="lab-status" className="text-xs font-medium text-foreground">Status</label>
          <select id="lab-status" name="status" defaultValue="draft" className={inputClass}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="lab-skill" className="text-xs font-medium text-foreground">Skill</label>
          <select id="lab-skill" name="skill" defaultValue="" className={inputClass}>
            <option value="">Uncategorized</option>
            {skills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="lab-description" className="text-xs font-medium text-foreground">Description</label>
          <input id="lab-description" name="description" placeholder="Short description" className={inputClass} />
        </div>
      </div>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        <Plus size={15} /> Create
      </Button>
    </form>
  );
}

export function LabsManager({ labs, skills }: { labs: Lab[]; skills: Skill[] }) {
  const skillsById = new Map(skills.map((s) => [s.id, s]));

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
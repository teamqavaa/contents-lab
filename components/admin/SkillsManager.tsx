"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { RowActions } from "@/components/admin/RowActions";
import { StatusDot } from "@/components/admin/StatusDot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  createSkillAction,
  createSkillOutcomeAction,
  createSkillPrerequisiteAction,
  deleteSkillAction,
  deleteSkillOutcomeAction,
  deleteSkillPrerequisiteAction,
  listSkillLabsAction,
  listSkillOutcomesAction,
  listSkillPrerequisitesAction,
  updateLabSkillsAction,
  updateSkillAction,
  updateSkillOutcomeAction,
  updateSkillPrerequisiteAction,
} from "@/lib/admin-actions";
import type { Lab, Skill } from "@/lib/api/lab-api";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

const columns: DataColumn<Skill>[] = [
  {
    key: "title",
    header: "Title",
    sortValue: (s) => s.title,
    render: (s) => (
      <div>
        <span className="font-medium">{s.title}</span>
        <span className="block text-xs text-muted-foreground">{s.slug}</span>
      </div>
    ),
  },
  {
    key: "lab_count",
    header: "Labs",
    sortValue: (s) => s.lab_count,
    render: (s) => <span className="tabular-nums text-muted-foreground">{s.lab_count}</span>,
  },
  {
    key: "order",
    header: "Order",
    sortValue: (s) => s.order,
    render: (s) => <span className="tabular-nums text-muted-foreground">{s.order}</span>,
  },
  {
    key: "icon",
    header: "Icon",
    render: (s) => <Badge variant="outline">{s.icon || "—"}</Badge>,
  },
  {
    key: "is_active",
    header: "Status",
    render: (s) => (
      <StatusDot status={s.is_active ? "active" : "draft"} />
    ),
  },
];

// Dynamic list of text bullets (outcomes or prerequisites) with add/remove.
function BulletList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: { id?: number; order: number; content: string }[];
  onChange: (items: { id?: number; order: number; content: string }[]) => void;
}) {
  function updateContent(index: number, content: string) {
    const next = items.map((item, i) => (i === index ? { ...item, content } : item));
    onChange(next);
  }

  function addItem() {
    onChange([...items, { order: items.length + 1, content: "" }]);
  }

  function removeItem(index: number) {
    const next = items.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i + 1 }));
    onChange(next);
  }

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground">{label}</label>
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground">No items yet.</p>
      )}
      {items.map((item, i) => (
        <div key={item.id ?? `new-${i}`} className="flex gap-1">
          <input
            value={item.content}
            onChange={(e) => updateContent(i, e.target.value)}
            placeholder={`${label} ${i + 1}`}
            className={inputClass}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-9 flex-shrink-0 px-0"
            onClick={() => removeItem(i)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus size={13} /> Add
      </Button>
    </div>
  );
}

// Multi-select lab picker that keeps its own checkbox state.
function LabPicker({
  labs,
  selected,
  onChange,
}: {
  labs: Lab[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
    );
  }

  return (
    <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-input p-2">
      {labs.length === 0 && (
        <p className="text-xs text-muted-foreground">No labs available.</p>
      )}
      {labs.map((lab) => (
        <label key={lab.id} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selected.includes(lab.id)}
            onChange={() => toggle(lab.id)}
          />
          <span className="text-foreground">
            {lab.title}
            <span className="ml-1 text-xs text-muted-foreground">({lab.language})</span>
          </span>
        </label>
      ))}
    </div>
  );
}

const ICON_CHOICES = [
  ["python", "Python"],
  ["web", "Web"],
  ["git", "Git"],
  ["api", "API"],
  ["sql", "SQL"],
  ["cli", "Command line"],
  ["docker", "Docker"],
  ["data-viz", "Data visualization"],
  ["testing", "Testing"],
  ["security", "Security"],
  ["backend", "Backend"],
  ["frontend", "Frontend"],
  ["data", "Data"],
  ["cloud", "Cloud"],
  ["mobile", "Mobile"],
] as const;

function SkillForm({ labs }: { labs: Lab[] }) {
  return (
    <form
      action={(formData) => {
        createSkillAction({ ok: false }, formData);
      }}
      className="space-y-3 rounded-xl border border-border bg-card p-4"
    >
      <p className="text-sm font-semibold">New skill</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Title</label>
          <input name="title" required placeholder="Git" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Slug</label>
          <input name="slug" placeholder="git" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Icon</label>
          <select name="icon" defaultValue="" className={inputClass}>
            <option value="">None</option>
            {ICON_CHOICES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Pace</label>
          <input name="pace" placeholder="self-paced" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Duration (weeks)</label>
          <input name="duration_weeks" type="number" min="0" defaultValue="0" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Order</label>
          <input name="order" type="number" min="0" defaultValue="0" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Certificate</label>
          <select name="includes_certificate" defaultValue="0" className={inputClass}>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Active</label>
          <select name="is_active" defaultValue="1" className={inputClass}>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-foreground">Description</label>
          <input name="description" placeholder="Short description" className={inputClass} />
        </div>
      </div>
      <Button type="submit">
        <Plus size={15} /> Create
      </Button>
    </form>
  );
}

// Edit panel: base fields, lab picker, outcomes, prerequisites.
function SkillEditPanel({
  skill,
  labs,
}: {
  skill: Skill;
  labs: Lab[];
}) {
  const [fields, setFields] = useState({
    title: skill.title,
    slug: skill.slug,
    description: skill.description ?? "",
    icon: skill.icon,
    order: skill.order,
    is_active: skill.is_active,
    duration_weeks: skill.duration_weeks,
    pace: skill.pace,
    includes_certificate: skill.includes_certificate,
  });
  const [selectedLabs, setSelectedLabs] = useState<string[]>([]);
  const [outcomes, setOutcomes] = useState<{ id?: number; order: number; content: string }[]>([]);
  const [prerequisites, setPrerequisites] = useState<{ id?: number; order: number; content: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing outcomes, prerequisites, and lab assignments on mount.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [outRes, preRes, allLabsRes] = await Promise.all([
        listSkillOutcomesAction(skill.id),
        listSkillPrerequisitesAction(skill.id),
        listSkillLabsAction(skill.id),
      ]);
      if (cancelled) return;
      setOutcomes((outRes.data ?? []).map((o) => ({ id: o.id, order: o.order, content: o.content })));
      setPrerequisites((preRes.data ?? []).map((p) => ({ id: p.id, order: p.order, content: p.content })));
      // Find labs assigned to this skill.
      const allLabs = allLabsRes.data ?? [];
      setSelectedLabs(allLabs.filter((l) => l.skills.includes(skill.id)).map((l) => l.id));
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [skill.id]);

  async function save() {
    setSaving(true);

    // 1. Update skill fields.
    await updateSkillAction(skill.id, {
      title: fields.title,
      slug: fields.slug,
      description: fields.description || null,
      icon: fields.icon,
      order: fields.order,
      is_active: fields.is_active,
      duration_weeks: fields.duration_weeks,
      pace: fields.pace,
      includes_certificate: fields.includes_certificate,
    });

    // 2. Update lab assignments via lab API (set skills on each lab).
    const allLabsRes = await listSkillLabsAction(skill.id);
    const allLabs = allLabsRes.data ?? [];
    // For each lab, update its skills list.
    for (const lab of allLabs) {
      const labHasSkill = lab.skills.includes(skill.id);
      const shouldBeIncluded = selectedLabs.includes(lab.id);
      if (labHasSkill !== shouldBeIncluded) {
        const newSkills = shouldBeIncluded
          ? [...lab.skills, skill.id]
          : lab.skills.filter((s) => s !== skill.id);
        await updateLabSkillsAction(lab.id, newSkills);
      }
    }

    // 3. Reconcile outcomes.
    const existingOutcomes = outcomes.filter((o) => o.id != null);
    const newOutcomes = outcomes.filter((o) => o.id == null);
    const currentOutcomeIds = new Set(outcomes.filter((o) => o.id != null).map((o) => o.id));
    const originalOutcomes = await listSkillOutcomesAction(skill.id);
    for (const orig of originalOutcomes.data ?? []) {
      if (!currentOutcomeIds.has(orig.id)) {
        await deleteSkillOutcomeAction(skill.id, orig.id);
      }
    }
    for (const o of existingOutcomes) {
      await updateSkillOutcomeAction(skill.id, o.id!, { order: o.order, content: o.content });
    }
    for (const o of newOutcomes) {
      await createSkillOutcomeAction(skill.id, { order: o.order, content: o.content });
    }

    // 4. Reconcile prerequisites.
    const existingPres = prerequisites.filter((p) => p.id != null);
    const newPres = prerequisites.filter((p) => p.id == null);
    const currentPreIds = new Set(prerequisites.filter((p) => p.id != null).map((p) => p.id));
    const originalPres = await listSkillPrerequisitesAction(skill.id);
    for (const orig of originalPres.data ?? []) {
      if (!currentPreIds.has(orig.id)) {
        await deleteSkillPrerequisiteAction(skill.id, orig.id);
      }
    }
    for (const p of existingPres) {
      await updateSkillPrerequisiteAction(skill.id, p.id!, { order: p.order, content: p.content });
    }
    for (const p of newPres) {
      await createSkillPrerequisiteAction(skill.id, { order: p.order, content: p.content });
    }

    setSaving(false);
    location.reload();
  }

  return (
    <div className="mb-6 space-y-4 rounded-xl border border-border bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Edit skill — {skill.title}</p>
        <Button type="button" size="sm" onClick={save} disabled={saving || loading}>
          {saving ? "Saving…" : "Save skill"}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Title</label>
          <input value={fields.title} onChange={(e) => setFields({ ...fields, title: e.target.value })} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Slug</label>
          <input value={fields.slug} onChange={(e) => setFields({ ...fields, slug: e.target.value })} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Icon</label>
          <select
            value={fields.icon}
            onChange={(e) => setFields({ ...fields, icon: e.target.value })}
            className={inputClass}
          >
            <option value="">None</option>
            {ICON_CHOICES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Pace</label>
          <input value={fields.pace} onChange={(e) => setFields({ ...fields, pace: e.target.value })} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Duration (weeks)</label>
          <input type="number" value={fields.duration_weeks} onChange={(e) => setFields({ ...fields, duration_weeks: Number(e.target.value) })} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Order</label>
          <input type="number" value={fields.order} onChange={(e) => setFields({ ...fields, order: Number(e.target.value) })} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Certificate</label>
          <select
            value={fields.includes_certificate ? "1" : "0"}
            onChange={(e) => setFields({ ...fields, includes_certificate: e.target.value === "1" })}
            className={inputClass}
          >
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Active</label>
          <select
            value={fields.is_active ? "1" : "0"}
            onChange={(e) => setFields({ ...fields, is_active: e.target.value === "1" })}
            className={inputClass}
          >
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-foreground">Description</label>
          <input value={fields.description} onChange={(e) => setFields({ ...fields, description: e.target.value })} className={inputClass} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-foreground">Labs</label>
          {loading ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : (
            <LabPicker labs={labs} selected={selectedLabs} onChange={setSelectedLabs} />
          )}
        </div>
        <div className="space-y-1 sm:col-span-2">
          {loading ? (
            <p className="text-xs text-muted-foreground">Loading bullets…</p>
          ) : (
            <>
              <BulletList label="What you'll learn" items={outcomes} onChange={setOutcomes} />
              <div className="mt-3" />
              <BulletList label="Prerequisites" items={prerequisites} onChange={setPrerequisites} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function SkillsManager({
  skills,
  labs,
}: {
  skills: Skill[];
  labs: Lab[];
}) {
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  if (editingSkill) {
    return (
      <div className="space-y-4">
        <SkillEditPanel skill={editingSkill} labs={labs} />
        <Button variant="outline" onClick={() => setEditingSkill(null)}>
          <X size={15} /> Close editor
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SkillForm labs={labs} />
      <DataTable
        rows={skills}
        rowKey={(s) => s.id}
        columns={columns}
        renderRowActions={(skill) => (
          <RowActions
            actions={[
              {
                icon: Pencil,
                label: "Edit skill",
                onClick: () => setEditingSkill(skill),
              },
              {
                icon: Pencil,
                label: skill.is_active ? "Deactivate" : "Activate",
                onClick: () =>
                  updateSkillAction(skill.id, { is_active: !skill.is_active }).then(() =>
                    location.reload()
                  ),
              },
              {
                icon: Trash2,
                label: "Delete",
                tone: "destructive",
                onClick: () => {
                  if (confirm(`Delete "${skill.title}"?`)) {
                    deleteSkillAction(skill.id).then(() => location.reload());
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

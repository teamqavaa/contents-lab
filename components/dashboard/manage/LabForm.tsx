'use client';

import { useState, useTransition } from 'react';
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from 'lucide-react';

import {
  saveLabAction,
  type LabActionResult,
  type LabStepInput,
  type ManagedLab,
  type SkillOption,
} from '@/actions/manageLabs';
import { inputClass } from '@/components/dashboard/manage/CourseForm';

interface LabFormProps {
  lab?: ManagedLab | null;
  skills: SkillOption[];
  isAdmin: boolean;
}

type Step = LabStepInput & { key: string };

let nextKey = 0;
const newKey = () => `step-${++nextKey}`;

function Field({ label, htmlFor, error, hint, children }: {
  label: string; htmlFor: string; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
      {label}
      {children}
      {hint && !error && <span className="text-xs font-normal text-neutral-400">{hint}</span>}
      {error && <span className="text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}

/** Formulaire d'un lab et de ses étapes (POST ou PATCH /api/labs/ via saveLabAction). */
export default function LabForm({ lab, skills, isAdmin }: LabFormProps) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<LabActionResult | null>(null);
  const errors = state?.errors ?? {};

  const [title, setTitle] = useState(lab?.title ?? '');
  const [description, setDescription] = useState(lab?.description ?? '');
  const [language, setLanguage] = useState<string>(lab?.language ?? 'python');
  const [difficulty, setDifficulty] = useState<string>(lab?.difficulty ?? 'guided');
  const [status, setStatus] = useState<string>(lab?.status ?? 'draft');
  const [starterCode, setStarterCode] = useState(lab?.starter_code ?? '');
  const [skillIds, setSkillIds] = useState<string[]>(lab?.skills ?? []);
  const [steps, setSteps] = useState<Step[]>(() =>
    (lab?.objectives ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((objective) => ({
        key: newKey(),
        id: objective.id,
        title: objective.title,
        content: objective.content,
        hint: objective.hint ?? '',
        starter_code: objective.starter_code ?? '',
      })),
  );

  const statusOptions = isAdmin
    ? [['draft', 'Draft'], ['review', 'Pending review'], ['published', 'Published']]
    : [['draft', 'Draft'], ['review', 'Submit for review']];

  const updateStep = (key: string, patch: Partial<Step>) =>
    setSteps((current) => current.map((step) => (step.key === key ? { ...step, ...patch } : step)));
  const moveStep = (index: number, delta: number) =>
    setSteps((current) => {
      const next = current.slice();
      const [step] = next.splice(index, 1);
      next.splice(index + delta, 0, step);
      return next;
    });
  const addStep = () =>
    setSteps((current) => [...current, { key: newKey(), title: '', content: '', hint: '', starter_code: '' }]);
  const toggleSkill = (id: string) =>
    setSkillIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveLabAction({
        slug: lab?.slug,
        title,
        description,
        language,
        difficulty,
        // Un instructeur qui modifie un lab publié garde son statut (seul un admin le change)
        status: !isAdmin && lab?.status === 'published' ? '' : status,
        starter_code: starterCode,
        skills: skillIds,
        objectives: steps.map(({ id, title: stepTitle, content, hint, starter_code: code }) => ({
          id, title: stepTitle, content, hint, starter_code: code,
        })),
      });
      // En cas de création réussie, l'action redirige vers l'éditeur
      if (!result) return;
      setState(result);
      // Les étapes créées reçoivent leur id : la prochaine sauvegarde les met à jour au lieu de les recréer
      const saved = result.lab?.objectives.slice().sort((a, b) => a.order - b.order);
      if (saved && saved.length === steps.length) {
        setSteps((current) => current.map((step, index) => ({ ...step, id: saved[index].id })));
      }
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 rounded-2xl bg-white p-5 md:p-6">
        <Field label="Title *" htmlFor="lab-title" error={errors.title}>
          <input id="lab-title" required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </Field>

        <Field label="Description" htmlFor="lab-description" error={errors.description}>
          <textarea id="lab-description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
        </Field>

        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Language" htmlFor="lab-language" error={errors.language}>
            <select id="lab-language" value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
              <option value="python">Python</option>
              <option value="php">PHP</option>
              <option value="typescript">TypeScript</option>
            </select>
          </Field>
          <Field label="Difficulty" htmlFor="lab-difficulty" error={errors.difficulty}>
            <select id="lab-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={inputClass}>
              <option value="guided">Guided</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </Field>
          <Field label="Status" htmlFor="lab-status" error={errors.status}>
            <select
              id="lab-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={!isAdmin && lab?.status === 'published'}
              className={inputClass}
            >
              {statusOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
              {!isAdmin && lab?.status === 'published' && <option value="published">Published</option>}
            </select>
          </Field>
        </div>

        <Field label="Starter code" htmlFor="lab-starter" error={errors.starter_code} hint="Code shown in the editor when a step has none">
          <textarea
            id="lab-starter"
            rows={5}
            spellCheck={false}
            value={starterCode}
            onChange={(e) => setStarterCode(e.target.value)}
            className={`${inputClass} font-mono text-xs`}
          />
        </Field>

        {skills.length > 0 && (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1.5 text-sm font-medium text-neutral-700">Skills</legend>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <label
                  key={skill.id}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                    skillIds.includes(skill.id)
                      ? 'border-[#6d5deb] bg-[#ece9fd] text-[#4f3fd6]'
                      : 'border-neutral-200 text-neutral-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={skillIds.includes(skill.id)}
                    onChange={() => toggleSkill(skill.id)}
                  />
                  {skill.title}
                </label>
              ))}
            </div>
            {errors.skills && <span className="text-xs text-red-600">{errors.skills}</span>}
          </fieldset>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Steps</h2>
            <p className="text-sm text-neutral-500">The learner completes the steps in this order.</p>
          </div>
          <button type="button" onClick={addStep} className="btn btn-secondary btn-sm">
            <Plus className="w-3.5 h-3.5" /> Add step
          </button>
        </div>
        {errors.objectives && <p className="text-xs text-red-600">{errors.objectives}</p>}

        {steps.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
            No step yet. Add the first one.
          </p>
        ) : (
          <ol className="flex flex-col gap-3">
            {steps.map((step, index) => (
              <li key={step.key} className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-neutral-900">Step {index + 1}</span>
                  <div className="flex gap-1">
                    <button type="button" className="btn btn-ghost btn-sm btn-icon" aria-label="Move step up" disabled={index === 0} onClick={() => moveStep(index, -1)}>
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm btn-icon" aria-label="Move step down" disabled={index === steps.length - 1} onClick={() => moveStep(index, 1)}>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-icon !text-red-600"
                      aria-label={`Delete step ${index + 1}`}
                      onClick={() => setSteps((current) => current.filter((item) => item.key !== step.key))}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <Field label="Title *" htmlFor={`${step.key}-title`}>
                  <input id={`${step.key}-title`} required value={step.title} onChange={(e) => updateStep(step.key, { title: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Instructions *" htmlFor={`${step.key}-content`} hint="Markdown is supported">
                  <textarea id={`${step.key}-content`} required rows={4} value={step.content} onChange={(e) => updateStep(step.key, { content: e.target.value })} className={inputClass} />
                </Field>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Hint" htmlFor={`${step.key}-hint`}>
                    <textarea id={`${step.key}-hint`} rows={3} value={step.hint} onChange={(e) => updateStep(step.key, { hint: e.target.value })} className={inputClass} />
                  </Field>
                  <Field label="Starter code" htmlFor={`${step.key}-code`}>
                    <textarea
                      id={`${step.key}-code`}
                      rows={3}
                      spellCheck={false}
                      value={step.starter_code}
                      onChange={(e) => updateStep(step.key, { starter_code: e.target.value })}
                      className={`${inputClass} font-mono text-xs`}
                    />
                  </Field>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {lab ? 'Save changes' : 'Create lab'}
        </button>
        {state && (
          <p role="status" className={`text-sm ${state.ok ? 'text-emerald-700' : 'text-red-600'}`}>{state.message}</p>
        )}
      </div>
    </form>
  );
}

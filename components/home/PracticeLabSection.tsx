// components/home/PracticeLabSection.tsx — « Learn it. Practise it. » : présentation du Practice Lab
import Link from 'next/link';
import { ArrowRight, BookOpen, Check, FlaskConical, History, Play, Zap } from 'lucide-react';

import type { CatalogCourse } from '@/actions/catalog';
import type { Lab } from '@/lib/lab/types';
import { publishedModules } from '@/lib/curriculum';
import { capitalize } from '@/lib/format';

const BENEFITS = [
  { icon: BookOpen, title: 'Right after each lesson', text: 'Practise the concept you just learned, without leaving the course.' },
  { icon: Check, title: 'Instant feedback', text: 'Run your work, see what passes and get a hint when you are stuck.' },
  { icon: History, title: 'Pick up where you left off', text: 'Your progress is saved on any device.' },
];

const FILENAMES: Record<Lab['language'], string> = { python: 'main.py', php: 'main.php', typescript: 'main.ts' };
const MAX_STEPS = 4;
const MAX_CODE_LINES = 10;

/** Texte brut d'une consigne Markdown (aperçu sur une ou deux lignes). */
function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`[\]]/g, '')
    .replace(/\(https?:[^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Données affichées dans la fenêtre d'aperçu (lab publié, sinon programme d'un career track). */
interface Preview {
  context: string;
  steps: { id: string; title: string }[];
  total: number;
  title: string;
  content: string;
  code: string[];
  filename: string;
  tag: string;
}

/** Démonstration : les étapes précédant l'étape courante sont cochées. */
function currentIndex(count: number) {
  return Math.min(Math.max(count - 2, 0), 2);
}

/** Lab mis en avant : celui qui a le plus d'étapes avec du code de départ (aperçu le plus parlant). */
function labPreview(labs: Lab[]): Preview | null {
  const score = (lab: Lab) => lab.steps.filter((step) => step.starterCode).length;
  const lab = labs
    .filter((l) => l.steps.length > 0)
    .sort((a, b) => score(b) - score(a) || b.steps.length - a.steps.length)[0];
  if (!lab) return null;
  const steps = lab.steps.slice(0, MAX_STEPS);
  const step = steps[currentIndex(steps.length)];
  return {
    context: lab.title,
    steps,
    total: lab.steps.length,
    title: step.title,
    content: plainText(step.content),
    code: (step.starterCode || lab.steps.find((s) => s.starterCode)?.starterCode || '').split('\n').slice(0, MAX_CODE_LINES),
    filename: FILENAMES[lab.language],
    tag: capitalize(lab.difficulty),
  };
}

/** Sans lab publié : les leçons publiées du career track qui en compte le plus (au moins deux). */
function trackPreview(courses: CatalogCourse[]): Preview | null {
  const best = courses
    .map((course) => ({ course, lessons: publishedModules(course).flatMap((module) => module.lessons) }))
    .filter(({ lessons }) => lessons.length > 1)
    .sort((a, b) => b.lessons.length - a.lessons.length)[0];
  if (best) {
    const { course, lessons } = best;
    const steps = lessons.slice(0, MAX_STEPS);
    const current = currentIndex(steps.length);
    const step = steps[current];
    return {
      context: `${course.title} / Lesson ${current + 1}`,
      steps,
      total: lessons.length,
      title: step.title,
      content: plainText(step.description),
      code: [],
      filename: 'practice',
      tag: capitalize(course.level),
    };
  }
  return null;
}

/** Fenêtre d'aperçu de l'atelier (décorative, masquée aux lecteurs d'écran). */
function LabPreview({ preview }: { preview: Preview }) {
  const { steps, code } = preview;
  const current = currentIndex(steps.length);
  const progress = Math.round(((current + 1) / preview.total) * 100);

  return (
    <div className="relative" aria-hidden="true">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/10">
        {/* Barre du haut : fil d'Ariane + progression */}
        <div className="flex items-center justify-between gap-4 border-b border-neutral-100 px-4 py-3 text-xs">
          <span className="flex min-w-0 items-center gap-2 text-neutral-500">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white">
              <Zap className="h-3 w-3 fill-current" />
            </span>
            <span className="truncate">
              {preview.context} / <span className="font-semibold text-neutral-900">Practice</span>
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-2 text-neutral-500">
            Step {current + 1} of {preview.total}
            <span className="h-1 w-14 overflow-hidden rounded-full bg-neutral-200">
              <span className="block h-full rounded-full bg-neutral-900" style={{ width: `${progress}%` }} />
            </span>
          </span>
        </div>

        <div className="grid sm:grid-cols-[0.8fr_1fr]">
          {/* Consigne */}
          <div className="flex flex-col p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Exercise</p>
            <p className="mt-2 text-sm font-bold text-neutral-900">{preview.title}</p>
            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-neutral-500">{preview.content}</p>
            <ol className="mt-4 space-y-2 text-xs">
              {steps.map((item, index) => (
                <li key={item.id} className="flex items-center gap-2">
                  {index < current ? (
                    <>
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#2f5d50] text-white">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                      <span className="truncate text-neutral-400 line-through">{item.title}</span>
                    </>
                  ) : (
                    <>
                      <span
                        className={`h-4 w-4 shrink-0 rounded-full border-2 ${index === current ? 'border-orange-400' : 'border-neutral-300'}`}
                      />
                      <span className={`truncate ${index === current ? 'font-semibold text-neutral-900' : 'text-neutral-500'}`}>
                        {item.title}
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ol>
          </div>

          {/* Éditeur */}
          <div className="flex min-w-0 flex-col bg-[#16171d] text-[11px] text-neutral-300">
            <div className="flex items-center justify-between border-b border-white/5 px-4">
              <span className="border-b-2 border-violet-500 py-2.5 font-mono font-semibold text-white">
                {preview.filename}
              </span>
              <span className="text-neutral-500">{preview.tag}</span>
            </div>
            <pre className="flex-1 overflow-hidden px-4 py-3 font-mono leading-5">
              {code.some(Boolean) ? (
                code.map((line, index) => (
                  <div key={index} className="flex gap-4 whitespace-pre">
                    <span className="w-4 shrink-0 text-right text-neutral-600">{index + 1}</span>
                    <span className="truncate">{line || ' '}</span>
                  </div>
                ))
              ) : (
                <span className="text-neutral-500"># Write your solution here</span>
              )}
            </pre>
            <div className="border-t border-white/5 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Checks</p>
              <ul className="mt-2 space-y-1 font-mono">
                {steps.slice(0, current + 1).map((item, index) => (
                  <li key={item.id} className={`truncate ${index < current ? 'text-lime-300' : 'text-orange-300'}`}>
                    {index < current ? '✓' : '●'} {item.title}
                    {index === current && ' … running'}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end gap-2 border-t border-white/5 px-4 py-3">
              <span className="rounded-[var(--radius-btn)] border border-white/10 px-3 py-1.5 font-semibold text-white">Reset</span>
              <span className="flex items-center gap-1.5 rounded-[var(--radius-btn)] bg-violet-600 px-3 py-1.5 font-semibold text-white">
                <Play className="h-3 w-3 fill-current" /> Run tests
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Badge flottant */}
      <span className="absolute -bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-neutral-100 bg-white py-1.5 pl-1.5 pr-4 text-xs font-semibold text-neutral-900 shadow-lg sm:-left-6">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-300">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
        {current} of {steps.length} checks passed
      </span>
    </div>
  );
}

export default function PracticeLabSection({ labs, courses }: { labs: Lab[]; courses: CatalogCourse[] }) {
  const preview = labPreview(labs) ?? trackPreview(courses);

  return (
    <section aria-labelledby="practice-lab-title" className="w-full bg-white px-4 py-20 md:px-10">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="flex flex-col items-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 py-1 pl-1 pr-3 text-xs font-medium text-neutral-700">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime-300 text-neutral-900">
              <FlaskConical className="h-3 w-3" aria-hidden="true" />
            </span>
            Practice Lab
          </span>
          <h2 id="practice-lab-title" className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-neutral-900 md:text-5xl">
            Learn it.
            <br />
            <span className="text-[#2f5d50]">Practise it.</span>
          </h2>
          <p className="mt-5 max-w-md text-neutral-500">
            Bring learning into practice in the Practice Lab, built into your learning experience.
          </p>

          <ul className="mt-8 space-y-5">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-neutral-900">{title}</span>
                  <span className="block text-sm text-neutral-500">{text}</span>
                </span>
              </li>
            ))}
          </ul>

          <Link href="/dashboard/labs" className="btn btn-dark btn-lg mt-9 shadow-lg shadow-neutral-900/20">
            Explore the Practice Lab <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {preview ? (
          <div className="rounded-3xl bg-neutral-100 p-4 sm:p-6">
            <LabPreview preview={preview} />
          </div>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl bg-neutral-100 p-10 text-center">
            <FlaskConical className="h-10 w-10 text-neutral-400" aria-hidden="true" />
            <p className="mt-4 font-semibold text-neutral-900">New labs are on the way</p>
            <p className="mt-1 text-sm text-neutral-500">Hands-on exercises will appear here as soon as they are published.</p>
          </div>
        )}
      </div>
    </section>
  );
}

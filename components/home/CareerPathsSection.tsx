// components/home/CareerPathsSection.tsx — « Explore Career Paths » : cours publiés regroupés par catégorie
import { Fragment } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Code2,
  Compass,
  Database,
  Layers,
  type LucideIcon,
  PenTool,
  Shield,
  TrendingUp,
} from 'lucide-react';

import type { CatalogCourse } from '@/actions/catalog';
import { courseTotals } from '@/lib/curriculum';
import { formatMinutes, plural } from '@/lib/format';

const MAX_PATHS = 3;
const MAX_TAGS = 4;

// Pastilles d'icône, dans l'ordre des cartes (orange, vert, violet comme la maquette)
const TONES = ['bg-orange-50 text-orange-500', 'bg-emerald-50 text-[#2f5d50]', 'bg-violet-50 text-violet-500'];

// Icône choisie d'après le nom de la catégorie (mots-clés), sinon icône générique
const ICONS: [RegExp, LucideIcon][] = [
  [/design|ux|ui|graphi/i, PenTool],
  [/develop|program|code|web|software|front|back/i, Code2],
  [/market|growth|seo|sales/i, TrendingUp],
  [/data|analyt|\bai\b|machine/i, BarChart3],
  [/cloud|devops|database|infra/i, Database],
  [/secur|cyber/i, Shield],
  [/business|manage|product|finance/i, Briefcase],
];

interface CareerPath {
  category: string;
  courses: CatalogCourse[];
  tags: string[];
  modules: number;
  minutes: number;
  href: string;
}

function iconFor(category: string): LucideIcon {
  return ICONS.find(([pattern]) => pattern.test(category))?.[1] ?? Layers;
}

/**
 * Même source que /career-tracks : chaque cours publié est un parcours, rangé dans sa catégorie.
 * Les catégories qui comptent le plus de parcours (puis d'apprenants) sont affichées en premier.
 */
function toCareerPaths(courses: CatalogCourse[]): CareerPath[] {
  const groups = new Map<string, CatalogCourse[]>();
  for (const course of courses) {
    const category = course.category_details?.name || 'Other';
    groups.set(category, [...(groups.get(category) ?? []), course]);
  }

  const students = (list: CatalogCourse[]) => list.reduce((total, c) => total + (c.total_students || 0), 0);

  return [...groups.entries()]
    .sort(([, a], [, b]) => b.length - a.length || students(b) - students(a))
    .slice(0, MAX_PATHS)
    .map(([category, list]) => {
      const totals = list.map(courseTotals);
      // Compétences = tags des cours de la catégorie (courses-api)
      const tags = [...new Set(list.flatMap((c) => (c.tags_details ?? []).map((tag) => tag.name)))];
      return {
        category,
        courses: list,
        tags: tags.slice(0, MAX_TAGS),
        modules: totals.reduce((total, t) => total + t.modules, 0),
        minutes: totals.reduce((total, t) => total + t.minutes, 0),
        // Un seul parcours : son learning path ; sinon /career-tracks filtré sur la catégorie
        href:
          list.length === 1
            ? `/career-tracks/${list[0].slug}`
            : `/career-tracks?category=${encodeURIComponent(category)}`,
      };
    });
}

export default function CareerPathsSection({ courses }: { courses: CatalogCourse[] }) {
  const paths = toCareerPaths(courses);
  if (paths.length === 0) return null;

  return (
    <section aria-labelledby="career-paths-title" className="w-full bg-[#f3f2ee] px-4 py-20 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Careers</p>
            <h2 id="career-paths-title" className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 md:text-4xl">
              Explore <span className="text-orange-500">Career Paths</span>
            </h2>
            <p className="mt-3 text-neutral-600">Explore career areas and the skills associated with them.</p>
          </div>
          <Link href="/career-tracks" className="btn btn-dark self-start sm:self-end">
            Explore Careers <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {paths.map((path, index) => {
            const Icon = iconFor(path.category);
            return (
              <li key={path.category} className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${TONES[index % TONES.length]}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-medium text-neutral-500">{plural(path.courses.length, 'course')}</span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-neutral-900">{path.category}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                  {path.courses.map((course, courseIndex) => (
                    <Fragment key={course.id}>
                      {courseIndex > 0 && ', '}
                      <Link
                        href={`/career-tracks/${course.slug}`}
                        className="underline decoration-neutral-300 underline-offset-2 hover:text-neutral-900 hover:decoration-neutral-900"
                      >
                        {course.title}
                      </Link>
                    </Fragment>
                  ))}
                </p>
                <p className="mt-2 text-xs font-medium text-neutral-400">
                  {plural(path.modules, 'module')}
                  {path.minutes > 0 && ` · ${formatMinutes(path.minutes)}`}
                </p>

                {path.tags.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Skills">
                    {path.tags.map((tag) => (
                      <li key={tag} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700">
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex-1" />
                <Link
                  href={path.href}
                  className="group mt-6 flex items-center justify-between border-t border-neutral-100 pt-4 text-sm font-semibold text-neutral-900"
                >
                  View career path
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </li>
            );
          })}

          <li className="flex flex-col rounded-2xl bg-neutral-900 p-6 text-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-300 text-neutral-900">
              <Compass className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-lg font-bold">Not sure where to start?</h3>
            <p className="mt-1 text-sm text-neutral-400">
              Compare career areas and find the skills that match your goals.
            </p>
            <div className="flex-1" />
            <Link
              href="/career-tracks"
              className="group mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm font-semibold text-lime-300"
            >
              See all career paths
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}

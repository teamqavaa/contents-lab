// components/learning/LearningHome.tsx — page d'accueil de l'utilisateur connecté
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  Flame,
  GraduationCap,
  Info,
  Target,
  Timer,
  Trophy,
} from 'lucide-react';

import type { CatalogCourse } from '@/actions/catalog';
import type { Enrollment, LearningStats } from '@/actions/dashboard';
import type { ConnectedUser } from '@/actions/user';
import Greeting from '@/components/dashboard/Greeting';
import { resumeHref } from '@/components/dashboard/mappers';
import { courseTotals } from '@/lib/curriculum';
import { capitalize, formatMinutes, plural, timeAgo } from '@/lib/format';
import { getFirstName } from '@/lib/initials';
import { learningStreaks } from '@/lib/streak';
import ProgressRing from './ProgressRing';

interface LearningHomeProps {
  user: ConnectedUser | null;
  enrollments: Enrollment[];
  stats: LearningStats | null;
  catalog: CatalogCourse[];
}

function Thumbnail({ src, className = '' }: { src?: string | null; className?: string }) {
  return (
    <div className={`overflow-hidden bg-gradient-to-br from-[#ece9fd] to-sky-100 ${className}`}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element -- miniatures servies par courses-api (domaines variables)
        <img src={src} alt="" className="h-full w-full object-cover" />
      )}
    </div>
  );
}

function SectionTitle({ title, hint, href }: { title: string; hint: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
        {title}
        <span title={hint} className="text-neutral-400">
          <Info className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">{hint}</span>
        </span>
      </h2>
      <Link href={href} className="text-sm font-medium text-[#4f3fd6] underline underline-offset-4">
        View all
      </Link>
    </div>
  );
}

function StatTile({ icon: Icon, value, label, tone }: { icon: typeof Trophy; value: string | number; label: string; tone: string }) {
  return (
    <div className="flex min-w-[150px] flex-1 items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3">
      <span className={`flex h-9 w-9 items-center justify-center rounded-full ${tone}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xl font-bold leading-tight text-neutral-900">{value}</p>
        <p className="text-xs text-neutral-500">{label}</p>
      </div>
    </div>
  );
}

function SideTile({ icon: Icon, value, label }: { icon: typeof Trophy; value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <div>
        <p className="text-2xl font-bold text-neutral-900">{value}</p>
        <p className="text-sm text-neutral-500">{label}</p>
      </div>
    </div>
  );
}

/**
 * Accueil personnalisé (maquette « Trenning » adaptée) : salutation, chiffres clés, nouveauté du catalogue,
 * cours en cours, nouveaux cours, temps d'apprentissage et objectifs. Données : SSO + courses-api.
 */
export default function LearningHome({ user, enrollments, stats, catalog }: LearningHomeProps) {
  const firstName = getFirstName(user?.name, user?.email);
  const inProgress = enrollments.filter((e) => e.progress_percentage < 100).slice(0, 4);
  const enrolledIds = new Set(enrollments.map((e) => e.course.id));
  const newCourses = catalog.filter((course) => !enrolledIds.has(course.id)).slice(0, 3);
  const latest = catalog[0];
  const totalLessons = enrollments.reduce((total, e) => total + e.total_lessons, 0);
  const streaks = learningStreaks(stats?.activity ?? []);
  const averageProgress = Math.round(stats?.average_progress ?? 0);

  return (
    <div className="min-h-screen bg-white px-4 pb-20 pt-24 md:px-10 md:pt-32">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        {/* Salutation + chiffres clés */}
        <section className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Greeting
              as="h1"
              emoji="👋"
              firstName={firstName}
              className="text-3xl font-bold tracking-tight text-neutral-900 md:text-[40px]"
            />
            <p className="mt-2 text-neutral-600">Welcome to Ignite, check your priority learning.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <StatTile icon={BookOpen} value={stats?.enrolled_courses ?? enrollments.length} label="Courses" tone="bg-amber-50 text-amber-600" />
            <StatTile icon={CheckCircle2} value={stats?.completed_lessons ?? 0} label="Lessons done" tone="bg-emerald-50 text-emerald-600" />
            <StatTile icon={Trophy} value={stats?.completed_courses ?? 0} label="Completed" tone="bg-orange-50 text-orange-500" />
          </div>
        </section>

        {/* Nouveauté du catalogue */}
        {latest && (
          <section className="rounded-2xl bg-emerald-50/70 px-5 py-4" aria-label="New on Ignite">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-emerald-500 px-3 py-1 text-sm font-medium text-white">New</span>
              <h2 className="font-bold text-neutral-900">{latest.title}</h2>
            </div>
            <p className="mt-2 text-sm text-neutral-700">
              {latest.subtitle || latest.description.slice(0, 140)}
              {latest.category_details && (
                <>
                  {' '}— new in <strong>&ldquo;{latest.category_details.name}&rdquo;</strong>.
                </>
              )}{' '}
              <Link href={`/courses/${latest.slug}`} className="inline-flex items-center gap-1 font-medium text-neutral-900 underline underline-offset-4">
                Go to detail <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </p>
          </section>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="flex min-w-0 flex-col gap-10">
            {/* Cours en cours */}
            <section>
              <SectionTitle
                title="In progress learning content"
                hint="The courses you are enrolled in, most recently opened first"
                href="/dashboard/courses?status=in-progress"
              />
              {inProgress.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
                  No course in progress.{' '}
                  <Link href="/courses" className="font-semibold text-[#4f3fd6] underline">Browse the catalog</Link>
                </div>
              ) : (
                <ul className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200">
                  {inProgress.map((enrollment) => {
                    const started = enrollment.completed_lessons > 0;
                    return (
                      <li key={enrollment.id} className="flex flex-col gap-4 p-3 sm:flex-row sm:items-center">
                        <Thumbnail src={enrollment.course.thumbnail} className="h-20 w-full shrink-0 rounded-xl sm:w-28" />
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                            <span className="flex h-4 w-4 items-center justify-center rounded bg-sky-500 text-white">
                              <BookOpen className="h-2.5 w-2.5" aria-hidden="true" />
                            </span>
                            {enrollment.course.category?.name || 'Course'}
                          </p>
                          <p className="mt-1 truncate font-semibold text-neutral-900">{enrollment.course.title}</p>
                        </div>
                        <dl className="grid grid-cols-3 gap-4 text-sm sm:w-[340px]">
                          <div>
                            <dt className="text-xs text-neutral-500">Content</dt>
                            <dd className="mt-1 flex items-center gap-1.5 font-medium text-neutral-800">
                              <FileText className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                              {plural(enrollment.total_lessons, 'lesson')}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-neutral-500">Completion</dt>
                            <dd className="mt-1 flex items-center gap-1.5 font-medium text-neutral-800">
                              {started ? (
                                <>
                                  <ProgressRing value={enrollment.progress_percentage} size={18} />
                                  {Math.round(enrollment.progress_percentage)}%
                                </>
                              ) : (
                                '—'
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-neutral-500">Last activity</dt>
                            <dd className="mt-1 flex items-center gap-1.5 font-medium text-neutral-800">
                              <Clock className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                              {timeAgo(enrollment.last_accessed_at)}
                            </dd>
                          </div>
                        </dl>
                        <Link
                          href={resumeHref(enrollment)}
                          className="rounded-xl border border-neutral-200 px-5 py-2.5 text-center text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
                        >
                          {started ? 'Continue' : 'Start'}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Nouveaux cours */}
            <section>
              <SectionTitle title="New courses" hint="The latest courses published on Ignite" href="/courses" />
              {newCourses.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
                  You are already enrolled in every published course.
                </p>
              ) : (
                <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {newCourses.map((course) => {
                    const totals = courseTotals(course);
                    return (
                      <li key={course.id}>
                        <Link
                          href={`/courses/${course.slug}`}
                          className="flex h-full flex-col rounded-2xl border border-neutral-200 p-1.5 transition-shadow hover:shadow-md"
                        >
                          <div className="relative">
                            <Thumbnail src={course.thumbnail} className="h-36 rounded-xl" />
                            <span className="absolute left-2 top-2 rounded-md bg-neutral-900/80 px-2 py-0.5 text-xs text-white">
                              {plural(totals.lessons, 'lesson')}
                            </span>
                          </div>
                          <div className="flex flex-1 flex-col p-3">
                            <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                              <span className="flex h-4 w-4 items-center justify-center rounded bg-sky-500 text-white">
                                <BookOpen className="h-2.5 w-2.5" aria-hidden="true" />
                              </span>
                              {course.category_details?.name || 'Course'}
                            </p>
                            <p className="mt-2 line-clamp-2 font-semibold text-neutral-900">{course.title}</p>
                            <div className="mt-auto flex flex-wrap gap-2 pt-4">
                              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600">{capitalize(course.level)}</span>
                              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600">{capitalize(course.language)}</span>
                              {totals.minutes > 0 && (
                                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600">{formatMinutes(totals.minutes)}</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          {/* Colonne de droite */}
          <aside className="flex flex-col gap-4">
            <SideTile icon={ClipboardCheck} value={totalLessons} label="Learning content" />
            <SideTile icon={Timer} value={formatMinutes(stats?.learning_minutes ?? 0)} label="Learning time" />

            <section className="rounded-2xl border border-neutral-200 p-5" aria-labelledby="goals-title">
              <h2 id="goals-title" className="flex items-center gap-2 font-bold text-neutral-900">
                Goals <Target className="h-4 w-4 text-neutral-400" aria-hidden="true" />
              </h2>
              <div className="mt-5 flex flex-col items-center text-center">
                <ProgressRing value={averageProgress} size={96} stroke={7}>
                  <GraduationCap className="h-8 w-8 text-neutral-400" aria-hidden="true" />
                </ProgressRing>
                <p className="mt-4 text-sm text-neutral-600">
                  Average progress: <strong className="text-neutral-900">{averageProgress}%</strong>
                </p>
                <p className="mt-4 flex items-center gap-1.5 text-sm text-neutral-600">
                  <Flame className="h-4 w-4 text-orange-500" aria-hidden="true" />
                  Current streak: <strong className="text-neutral-900">{streaks.current} day{streaks.current === 1 ? '' : 's'}</strong>
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Longest streak (30 days): {streaks.longest} day{streaks.longest === 1 ? '' : 's'}
                </p>
                <Link href="/dashboard" className="mt-4 text-sm font-medium text-[#4f3fd6] underline underline-offset-4">
                  See detail
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

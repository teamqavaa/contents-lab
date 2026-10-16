// app/(main)/career-tracks/[slug]/page.tsx — « learning path » d'un cours : ses modules dans l'ordre
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BarChart3, BookOpen, Check, CheckCircle2, ChevronDown, Clock, Flag, Globe, PlayCircle } from 'lucide-react';

import { getPublishedCourse } from '@/actions/catalog';
import { getEnrollment } from '@/actions/dashboard';
import AddToCartButton from '@/components/courses/AddToCartButton';
import { resumeHref } from '@/components/dashboard/mappers';
import { courseTotals, moduleMinutes, publishedModules } from '@/lib/curriculum';
import { capitalize, formatMinutes, plural } from '@/lib/format';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const course = await getPublishedCourse((await params).slug);
  return { title: course ? `${course.title} · Learning path` : 'Learning path' };
}

export default async function LearningPathPage({ params }: Params) {
  const { slug } = await params;
  const [course, enrollment] = await Promise.all([getPublishedCourse(slug), getEnrollment(slug)]);
  if (!course) notFound();

  const modules = publishedModules(course);
  const totals = courseTotals(course);
  const completed = new Set(enrollment?.completed_lesson_ids ?? []);
  const level = course.level === 'all' ? 'All levels' : capitalize(course.level);

  return (
    <main className="min-h-screen bg-[#f3f4f6] px-4 pb-24 pt-24 md:pt-32">
      <div className="mx-auto max-w-[880px]">
        <nav aria-label="Breadcrumb" className="text-sm text-neutral-600">
          <Link href="/career-tracks" className="underline underline-offset-2 hover:text-neutral-900">
            Career tracks
          </Link>
          {' / '}
          {course.category_details?.name ?? course.title}
        </nav>

        <span className="mt-5 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          Learning path · {plural(totals.modules, 'module')}
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-neutral-900 md:text-5xl">{course.title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-600">{course.subtitle || course.description}</p>

        <ul className="mt-7 flex flex-wrap gap-3 text-sm text-neutral-800">
          <li className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5">
            <Clock className="h-4 w-4" aria-hidden="true" /> {formatMinutes(totals.minutes)}
          </li>
          <li className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5">
            <BarChart3 className="h-4 w-4" aria-hidden="true" /> {level}
          </li>
          <li className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5">
            <Globe className="h-4 w-4" aria-hidden="true" /> {capitalize(course.language)}
          </li>
          {enrollment && (
            <li className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-emerald-800">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {Math.round(enrollment.progress_percentage)}% completed
            </li>
          )}
        </ul>

        {modules.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-500">
            The modules of this track are being prepared.
          </p>
        ) : (
          <ol className="mt-12 flex flex-col">
            {modules.map((module, index) => {
              const done = enrollment && module.lessons.length > 0 && module.lessons.every((l) => completed.has(l.id));
              return (
                <li key={module.id} className="grid grid-cols-[48px_1fr] gap-4 md:grid-cols-[56px_1fr] md:gap-5">
                  {/* Étape + connecteur vers l'étape suivante */}
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-lg font-bold md:h-14 md:w-14 md:text-xl ${
                        done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-indigo-600 bg-white text-indigo-700'
                      }`}
                    >
                      {done ? <Check className="h-6 w-6" aria-label="Completed" /> : index + 1}
                    </span>
                    <span className="w-0.5 flex-1 bg-indigo-600" aria-hidden="true" />
                    <ChevronDown className="-mt-2 h-4 w-4 text-indigo-600" aria-hidden="true" />
                  </div>

                  <details className="group mb-6 rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-neutral-600">Module {index + 1}</p>
                        <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                          Step {index + 1} / {modules.length}
                        </span>
                      </div>
                      <h2 className="mt-2 text-xl font-bold text-neutral-900">{module.title}</h2>
                      {module.description && <p className="mt-2 text-neutral-600">{module.description}</p>}
                      <p className="mt-4 flex flex-wrap items-center gap-5 text-sm text-neutral-600">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4" aria-hidden="true" /> {plural(module.lessons.length, 'lesson')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" aria-hidden="true" /> {formatMinutes(moduleMinutes(module))}
                        </span>
                        {module.lessons.length > 0 && (
                          <span className="flex items-center gap-1 font-medium text-indigo-700">
                            <span className="group-open:hidden">Show lessons</span>
                            <span className="hidden group-open:inline">Hide lessons</span>
                            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                          </span>
                        )}
                      </p>
                    </summary>
                    {module.lessons.length > 0 && (
                      <ul className="mt-4 flex flex-col gap-1 border-t border-neutral-100 pt-4">
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm">
                            {completed.has(lesson.id) ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-label="Completed" />
                            ) : (
                              <PlayCircle className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />
                            )}
                            <span className="flex-1 text-neutral-800">{lesson.title}</span>
                            {lesson.is_preview && <span className="text-xs font-medium text-emerald-700">Preview</span>}
                            <span className="text-xs text-neutral-500">{formatMinutes(lesson.duration_in_minutes)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </details>
                </li>
              );
            })}

            {/* Fin du parcours */}
            <li className="grid grid-cols-[48px_1fr] gap-4 md:grid-cols-[56px_1fr] md:gap-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white md:h-14 md:w-14">
                <Flag className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-6 rounded-2xl bg-[#111827] p-6 text-white md:flex-row md:items-center md:justify-between md:p-7">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Complete track</p>
                  <h2 className="mt-2 text-2xl font-bold">
                    {enrollment ? 'Keep going on your path' : 'Ready to start the path?'}
                  </h2>
                  <ul className="mt-3 flex flex-col gap-1.5 text-sm text-neutral-300">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4" aria-hidden="true" /> {totals.modules === 1 ? 'The module' : `The ${totals.modules} modules, in order`}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4" aria-hidden="true" /> {plural(totals.lessons, 'lesson')} · {formatMinutes(totals.minutes)} of content
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col items-start gap-3 md:items-end">
                  {enrollment ? (
                    <Link
                      href={resumeHref(enrollment)}
                      className="btn btn-primary btn-lg"
                    >
                      <PlayCircle className="h-5 w-5" aria-hidden="true" />
                      {enrollment.completed_lessons > 0 ? 'Continue the path' : 'Start the path'}
                    </Link>
                  ) : (
                    <AddToCartButton courseId={course.id} courseSlug={course.slug} />
                  )}
                  <Link href={`/courses/${course.slug}`} className="text-sm text-neutral-300 underline underline-offset-4 hover:text-white">
                    View course details
                  </Link>
                </div>
              </div>
            </li>
          </ol>
        )}
      </div>
    </main>
  );
}

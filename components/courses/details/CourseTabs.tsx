'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, ChevronDown, Eye, FileText, HelpCircle, PlayCircle, Star, Users } from 'lucide-react';

import type { CatalogModule } from '@/actions/catalog';
import { getInitials } from '@/lib/initials';
import { formatMinutes, plural } from '@/lib/format';
import { moduleMinutes } from '@/lib/curriculum';

export interface CourseTabsData {
  learn: string[];
  highlights: string[];
  description: string;
  prerequisites: string;
  audience: string;
  modules: CatalogModule[];
  totals: { modules: number; lessons: number; minutes: number };
  instructor: {
    name: string;
    courses: { slug: string; title: string; category: string }[];
    learners: number;
  };
  reviews: { rating: number; count: number; students: number };
  faq: { question: string; answer: string }[];
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'curriculum', label: 'Curriculum' },
  { id: 'instructor', label: 'Instructor' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'faq', label: 'FAQ' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const card = 'rounded-xl border border-neutral-200 bg-white p-5 md:p-6';

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${rating >= n - 0.25 ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

function LessonIcon({ type }: { type: string }) {
  if (type === 'QUIZ') return <HelpCircle className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />;
  if (type === 'ARTICLE' || type === 'DOCUMENT') return <FileText className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />;
  return <PlayCircle className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />;
}

/** Onglets de la page détail : Aperçu, Programme, Formateur, Avis, FAQ (données de courses-api). */
export default function CourseTabs({ data }: { data: CourseTabsData }) {
  const [tab, setTab] = useState<TabId>('overview');

  return (
    <div id="course-tabs">
      <div role="tablist" aria-label="Course sections" className="flex gap-1 overflow-x-auto border-b border-neutral-200">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setTab(id)}
            className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
              tab === id ? 'border-indigo-600 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-5 flex flex-col gap-6">
        {tab === 'overview' && (
          <>
            {data.learn.length > 0 && (
              <section className={card}>
                <h2 className="text-lg font-bold text-neutral-900">What you&apos;ll learn</h2>
                <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {data.learn.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" /> {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h2 className="text-lg font-bold text-neutral-900">Description</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-700">{data.description}</p>
              {data.highlights.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {data.highlights.map((item) => (
                    <li key={item} className="rounded bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">{item}</li>
                  ))}
                </ul>
              )}
            </section>

            {(data.prerequisites || data.audience) && (
              <div className="grid gap-4 sm:grid-cols-2">
                {data.prerequisites && (
                  <section className={card}>
                    <h3 className="text-sm font-bold text-neutral-900">Prerequisites</h3>
                    <p className="mt-2 whitespace-pre-line text-sm text-neutral-600">{data.prerequisites}</p>
                  </section>
                )}
                {data.audience && (
                  <section className={card}>
                    <h3 className="text-sm font-bold text-neutral-900">Who is this course for?</h3>
                    <p className="mt-2 whitespace-pre-line text-sm text-neutral-600">{data.audience}</p>
                  </section>
                )}
              </div>
            )}
          </>
        )}

        {tab === 'curriculum' && (
          <section>
            <p className="text-sm text-neutral-600">
              {plural(data.totals.modules, 'section')} · {plural(data.totals.lessons, 'lesson')} · {formatMinutes(data.totals.minutes)} total
            </p>
            {data.modules.length === 0 ? (
              <p className={`${card} mt-3 text-sm text-neutral-500`}>The curriculum is being prepared.</p>
            ) : (
              <ol className="mt-3 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                {data.modules.map((module, index) => (
                  <li key={module.id} className="border-b border-neutral-200 last:border-b-0">
                    <details className="group" open={index === 0}>
                      <summary className="flex cursor-pointer list-none items-center gap-3 bg-neutral-50 px-4 py-3.5">
                        <ChevronDown className="h-4 w-4 shrink-0 text-neutral-500 transition-transform group-open:rotate-180" aria-hidden="true" />
                        <span className="flex-1 text-sm font-semibold text-neutral-900">{module.title}</span>
                        <span className="text-xs text-neutral-500">
                          {plural(module.lessons.length, 'lesson')} · {formatMinutes(moduleMinutes(module))}
                        </span>
                      </summary>
                      <ul className="flex flex-col px-4 py-2">
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center gap-3 py-2 text-sm">
                            <LessonIcon type={lesson.lesson_type} />
                            <span className="flex-1 text-neutral-700">{lesson.title}</span>
                            {lesson.is_preview && (
                              <span className="flex items-center gap-1 text-xs font-medium text-indigo-700">
                                <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Preview
                              </span>
                            )}
                            <span className="w-14 text-right text-xs text-neutral-500">{formatMinutes(lesson.duration_in_minutes)}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}

        {tab === 'instructor' && (
          <section className={card}>
            {data.instructor.name ? (
              <>
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                    {getInitials(data.instructor.name)}
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">{data.instructor.name}</h2>
                    <p className="text-sm text-neutral-500">Instructor on Qavaa Ignite</p>
                  </div>
                </div>
                <ul className="mt-4 flex flex-wrap gap-5 text-sm text-neutral-700">
                  <li className="flex items-center gap-1.5">
                    <PlayCircle className="h-4 w-4 text-neutral-500" aria-hidden="true" /> {plural(data.instructor.courses.length, 'course')}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-neutral-500" aria-hidden="true" /> {data.instructor.learners.toLocaleString('en-US')} learners
                  </li>
                </ul>
                {data.instructor.courses.length > 1 && (
                  <>
                    <h3 className="mt-6 text-sm font-bold text-neutral-900">Courses by {data.instructor.name}</h3>
                    <ul className="mt-2 flex flex-col gap-1">
                      {data.instructor.courses.map((course) => (
                        <li key={course.slug}>
                          <Link href={`/courses/${course.slug}`} className="text-sm text-indigo-700 underline-offset-4 hover:underline">
                            {course.title}
                          </Link>
                          <span className="text-xs text-neutral-500"> · {course.category}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            ) : (
              <p className="text-sm text-neutral-500">Instructor details are not available for this course yet.</p>
            )}
          </section>
        )}

        {tab === 'reviews' && (
          <section className={card}>
            {data.reviews.count > 0 ? (
              <div className="flex flex-wrap items-center gap-6">
                <div className="text-center">
                  <p className="text-5xl font-extrabold text-neutral-900">{data.reviews.rating.toFixed(1)}</p>
                  <Stars rating={data.reviews.rating} />
                  <p className="mt-1 text-xs font-medium text-neutral-500">Course rating</p>
                </div>
                <p className="max-w-sm text-sm text-neutral-600">
                  Based on {data.reviews.count.toLocaleString('en-US')} reviews from{' '}
                  {data.reviews.students.toLocaleString('en-US')} learners.
                </p>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No reviews yet. Learners can rate the course once they have followed it.</p>
            )}
          </section>
        )}

        {tab === 'faq' && (
          <section className="flex flex-col gap-2">
            {data.faq.map(({ question, answer }) => (
              <details key={question} className="group rounded-xl border border-neutral-200 bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-neutral-900">
                  {question}
                  <ChevronDown className="h-4 w-4 shrink-0 text-neutral-500 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="px-5 pb-4 text-sm leading-relaxed text-neutral-600">{answer}</p>
              </details>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

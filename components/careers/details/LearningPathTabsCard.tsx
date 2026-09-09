'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LearningPathDetails, CareerCourse } from '@/actions/careers';

interface LearningPathTabsCardProps {
  path: LearningPathDetails;
}

export default function LearningPathTabsCard({ path }: LearningPathTabsCardProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'COURSES'>('OVERVIEW');

  const sortedOutcomes = [...path.outcomes].sort((a, b) => a.order - b.order);
  const sortedPrerequisites = [...path.prerequisites].sort((a, b) => a.order - b.order);

  return (
    <div className="w-full bg-white rounded-3xl border border-neutral-200 overflow-hidden font-mono shadow-xs">
      <div className="flex border-b border-neutral-200 px-6 pt-4 gap-8">
        {(['OVERVIEW', 'COURSES'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-xs font-bold tracking-wider cursor-pointer relative transition-colors ${
              activeTab === tab ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-neutral-900" />
            )}
          </button>
        ))}
      </div>

      <div className="p-6 sm:p-10 flex flex-col gap-8">
        {activeTab === 'OVERVIEW' && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 flex flex-col gap-4">
                <h3 className="text-xl font-bold text-neutral-900">About this path</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{path.description}</p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-6 flex flex-col gap-3">
                <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                  TIME COMMITMENT
                </span>
                <div className="flex flex-col gap-2 text-xs font-semibold text-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Duration</span>
                    <span>{path.duration_weeks} weeks</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Pace</span>
                    <span>{path.pace}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Courses</span>
                    <span>{path.courses.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Certificate</span>
                    <span>{path.includes_certificate ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>

            {sortedOutcomes.length > 0 && (
              <div className="flex flex-col gap-4 pt-4 border-t border-neutral-100">
                <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                  YOU'LL BE ABLE TO
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-neutral-800">
                  {sortedOutcomes.map((outcome) => (
                    <div key={outcome.id} className="flex items-start gap-2.5">
                      <span className="text-neutral-900 font-bold">✓</span>
                      <span className="leading-relaxed">{outcome.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sortedPrerequisites.length > 0 && (
              <div className="flex flex-col gap-4 pt-4 border-t border-neutral-100">
                <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                  PREREQUISITES
                </span>
                <ul className="list-disc space-y-2 pl-4 text-sm text-neutral-600">
                  {sortedPrerequisites.map((item) => (
                    <li key={item.id}>{item.content}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'COURSES' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-neutral-900">
              Courses in this path ({path.courses.length})
            </h3>
            {path.courses.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {path.courses.map((course) => (
                  <CourseMiniCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
                No courses in this path yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseMiniCard({ course }: { course: CareerCourse }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition-shadow hover:shadow-md"
    >
      <div className="flex flex-col gap-3 p-5">
        <h4 className="text-sm font-bold leading-snug text-neutral-900 line-clamp-2">
          {course.title}
        </h4>
        <p className="text-xs leading-relaxed text-neutral-500 line-clamp-2">
          {course.description || course.subtitle || 'No description available.'}
        </p>
      </div>
      <div className="flex items-center justify-between border-t border-neutral-100 p-5 pt-3">
        <span className="text-xs font-medium text-neutral-500">{course.level}</span>
        <span className="rounded-lg border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-800 transition-colors hover:bg-neutral-50">
          Details
        </span>
      </div>
    </Link>
  );
}

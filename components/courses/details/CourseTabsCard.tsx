'use client';

import { CourseDetails } from '@/actions/courseDetail';
import { useState } from 'react';

interface CourseTabsCardProps {
  course: CourseDetails;
}

export default function CourseTabsCard({ course }: CourseTabsCardProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CURRICULUM' | 'REVIEWS'>('OVERVIEW');

  return (
    <div className="w-full bg-white rounded-3xl border border-neutral-200 overflow-hidden font-mono shadow-xs">
      {/* Barre d'onglets */}
      <div className="flex border-b border-neutral-200 px-6 pt-4 gap-8">
        {(['OVERVIEW', 'CURRICULUM', 'REVIEWS'] as const).map((tab) => (
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

      {/* Contenu principal */}
      <div className="p-6 sm:p-10 flex flex-col gap-8">
        {activeTab === 'OVERVIEW' && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Description */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <h3 className="text-xl font-bold text-neutral-900">About this course</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{course.description}</p>
              </div>

              {/* Bloc "HIGHLIGHTS" (remplace who_this_is_for) */}
              {course.highlights && course.highlights.length > 0 && (
                <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-6 flex flex-col gap-3">
                  <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                    COURSE HIGHLIGHTS
                  </span>
                  <ul className="flex flex-col gap-2">
                    {course.highlights.map((highlight) => (
                      <li key={highlight.id} className="text-xs text-neutral-700 leading-relaxed flex items-start gap-2">
                        <span className="text-neutral-900 font-bold">•</span>
                        <span>{highlight.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Section "LEARNING POINTS" (ce qu'on va apprendre) */}
            {course.learning_points && course.learning_points.length > 0 && (
              <div className="flex flex-col gap-4 pt-4 border-t border-neutral-100">
                <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                  WHAT YOU&apos;LL LEARN
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-neutral-800">
                  {course.learning_points.map((point) => (
                    <div key={point.id} className="flex items-start gap-2.5">
                      <span className="text-neutral-900 font-bold">✓</span>
                      <span className="leading-relaxed">{point.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section "OUTCOMES" (compétences/résultats) */}
            {course.outcomes && course.outcomes.length > 0 && (
              <div className="flex flex-col gap-4 pt-4 border-t border-neutral-100">
                <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                  KEY OUTCOMES
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-neutral-800">
                  {course.outcomes.map((outcome) => (
                    <div key={outcome.id} className="flex items-start gap-2.5">
                      <span className="text-neutral-900 font-bold">★</span>
                      <span className="leading-relaxed">{outcome.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'CURRICULUM' && (
          <div className="flex flex-col gap-6 py-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-neutral-900">Course Curriculum</h3>
              <span className="text-xs text-neutral-500 font-semibold">
                {course.modules?.length || 0} module(s)
              </span>
            </div>

            {/* Liste des modules et leçons */}
            <div className="flex flex-col gap-4">
              {course.modules?.map((module) => (
                <div key={module.id} className="border border-neutral-200 rounded-2xl p-5 bg-neutral-50/50 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-neutral-900">{module.title}</h4>
                    <span className="text-[11px] text-neutral-500 bg-neutral-200/60 px-2.5 py-0.5 rounded-full font-medium">
                      {module.lessons_count} lessons
                    </span>
                  </div>
                  {module.description && (
                    <p className="text-xs text-neutral-600">{module.description}</p>
                  )}

                  {/* Leçons imbriquées */}
                  {module.lessons && module.lessons.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-neutral-200/60">
                      {module.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex justify-between items-center text-xs text-neutral-700 bg-white p-3 rounded-xl border border-neutral-200/80">
                          <span className="font-medium">{lesson.title}</span>
                          <span className="text-[11px] text-neutral-400">
                            {lesson.duration_in_minutes} min
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'REVIEWS' && (
          <div className="flex flex-col gap-4 py-2">
            <h3 className="text-lg font-bold text-neutral-900">Student Reviews</h3>
            <div className="flex items-center gap-4 bg-neutral-50 border border-neutral-200 rounded-2xl p-6">
              <div className="text-3xl font-extrabold text-neutral-900">{course.average_rating}</div>
              <div className="flex flex-col gap-1">
                <div className="text-xs font-bold text-neutral-800">Course Rating</div>
                <div className="text-xs text-neutral-500">Based on {course.total_reviews} reviews ({course.total_students} students enrolled)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

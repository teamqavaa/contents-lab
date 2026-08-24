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

              {/* Bloc "WHO THIS IS FOR" */}
              <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-6 flex flex-col gap-3">
                <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                  WHO THIS IS FOR
                </span>
                <p className="text-xs text-neutral-700 leading-relaxed">{course.who_this_is_for}</p>
              </div>
            </div>

            {/* Section "YOU'LL LEARN TO" */}
            <div className="flex flex-col gap-4 pt-4 border-t border-neutral-100">
              <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                YOU'LL LEARN TO
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-neutral-800">
                {course.learning_outcomes?.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="text-neutral-900 font-bold">✓</span>
                    <span className="leading-relaxed">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'CURRICULUM' && (
          <div className="text-sm text-neutral-600 py-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Curriculum</h3>
            <p>{course.lessons_count} lessons total ({course.total_duration}).</p>
          </div>
        )}

        {activeTab === 'REVIEWS' && (
          <div className="text-sm text-neutral-600 py-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Student Reviews</h3>
            <p>Average rating: {course.average_rating} out of 5 based on {course.total_reviews} reviews.</p>
          </div>
        )}
      </div>
    </div>
  );
}

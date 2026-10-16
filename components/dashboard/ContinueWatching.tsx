'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { Enrollment } from '@/actions/dashboard';
import CourseCard from '@/components/courses/CourseCard';
import { enrollmentToCourse, progressProps } from './mappers';

/** Carrousel des cours inscrits avec leur barre de progression de lecture. */
export default function ContinueWatching({ enrollments }: { enrollments: Enrollment[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">Continue Watching</h2>
        {enrollments.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label="Previous courses"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-500 hover:text-neutral-900"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label="Next courses"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6d5deb] text-white hover:bg-[#5a4ad6]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {enrollments.length ? (
        <div ref={trackRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none]">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="snap-start shrink-0 w-[85%] sm:w-[calc(50%-8px)] xl:w-[calc(33.333%-11px)]">
              <CourseCard course={enrollmentToCourse(enrollment)} progress={progressProps(enrollment)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-8 text-center">
          <p className="text-sm text-neutral-500">You are not enrolled in any course yet.</p>
          <Link href="/courses" className="mt-3 inline-block text-sm font-semibold text-[#6d5deb] hover:underline">
            Browse courses
          </Link>
        </div>
      )}
    </section>
  );
}

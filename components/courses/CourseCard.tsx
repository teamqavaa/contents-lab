'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Course } from '@/actions/courses';
import AddToCartButton from './AddToCartButton';

interface CourseCardProps {
  course: Course & {
    description?: string;
  };
  initialInCart?: boolean;
  /** Mode « Continue watching » (dashboard) : barre de progression de lecture à la place du prix. */
  progress?: {
    percentage: number;
    completedLessons: number;
    totalLessons: number;
    href: string;
    category?: string;
  };
}

export default function CourseCard({ course, initialInCart, progress }: CourseCardProps) {
  const {
    id,
    title,
    description,
    image,
    duration,
    lessonsCount,
    rating,
    price,
    originalPrice,
  } = course;

  return (
    <div className="flex flex-col bg-white rounded-3xl shadow-sm border border-neutral-100 hover:shadow-md transition-shadow overflow-hidden h-full">
      <div className="relative w-full aspect-[16/10] bg-neutral-100">
        <Image
          src={image || '/career.jpg'}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
        />
        {progress?.category && (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#6d5deb]">
            {progress.category}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 mb-3">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 stroke-current stroke-[2]" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{duration}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 stroke-current stroke-[2]" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            </svg>
            <span>{lessonsCount} Lessons</span>
          </div>

          <div className="flex items-center gap-1 text-neutral-900 font-bold">
            <span className="text-amber-400">★</span>
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>

        <h3 className="text-base font-bold text-neutral-900 mb-2 line-clamp-1">
          {title}
        </h3>

        {description && (
          <p className="text-xs text-neutral-500 mb-4 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {progress ? (
          <div className="mt-auto pt-3 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500">
                <span>
                  {progress.completedLessons}/{progress.totalLessons} lessons watched
                </span>
                <span className="text-neutral-900">{Math.round(progress.percentage)}%</span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100"
                role="progressbar"
                aria-label={`Progress of ${title}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress.percentage)}
              >
                <div
                  className="h-full rounded-full bg-[#6d5deb] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
                />
              </div>
            </div>
            <Link
              href={progress.href}
              className="btn btn-dark btn-sm"
            >
              {progress.percentage >= 100 ? 'Watch again' : progress.completedLessons > 0 ? 'Continue' : 'Start course'}
            </Link>
          </div>
        ) : (
          <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-neutral-900 leading-none">
                ${price.toFixed(2)} <span className="text-[10px] font-semibold text-neutral-500">USD</span>
              </span>
              {originalPrice && (
                <span className="text-xs font-semibold text-neutral-400 line-through mt-0.5">
                  ${originalPrice.toFixed(2)} USD
                </span>
              )}
            </div>

            <AddToCartButton courseId={id} initialInCart={initialInCart} courseSlug={course.slug} />
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';

export interface CourseItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  badge: string;
  courseType: 'Short Course' | 'Course' | 'Professional Certificate';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topic: string;
  orgName: string;
  orgLogo: string;
  image: string;
  price: number;
  originalPrice?: number;
  isFavorite?: boolean;
  isInProgress?: boolean;
}

interface CourseCardProps {
  course: CourseItem;
  onToggleFavorite: (id: string) => void;
}

export default function CourseCard({ course, onToggleFavorite }: CourseCardProps) {
  // On force l'utilisation du slug
  const targetSlug = course.slug;
  const coursePath = `/courses/${targetSlug}`;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group">

      {/* Header visuel & Contenu */}
      <div>
        <div className="relative w-full aspect-[16/10] bg-neutral-900 overflow-hidden">
          <Link href={coursePath} className="block relative w-full h-full">
            <Image
              src={course.image}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span className="bg-white/90 backdrop-blur-md text-neutral-900 text-xs font-semibold px-3 py-1 rounded-full">
              {course.badge}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(course.id);
            }}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-neutral-700 hover:bg-white hover:text-red-500 transition-colors shadow-xs cursor-pointer"
            aria-label="Favorite"
          >
            <svg
              className={`w-4 h-4 ${course.isFavorite ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-current stroke-[2]'}`}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.575-4.688-4.575-1.742 0-3.262.908-4.312 2.29C10.95 4.583 9.43 3.675 7.688 3.675 5.099 3.675 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-600">{course.orgName}</span>
          </div>

          <Link href={coursePath}>
            <h3 className="text-base font-bold text-neutral-900 leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
              {course.title}
            </h3>
          </Link>

          <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
            {course.description}
          </p>
        </div>
      </div>

      <div className="p-5 pt-0 flex items-center justify-between border-t border-neutral-100 mt-2">
        <div className="flex items-center gap-3 text-xs font-medium text-neutral-500 pt-3">
          <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
            <svg className="w-3.5 h-3.5 stroke-neutral-500 stroke-[1.8]" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.659A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
            <span>
              {course.price === 0 ? (
                <span className="text-emerald-600 font-bold">Free</span>
              ) : (
                `$${course.price}`
              )}
            </span>
            {course.originalPrice && course.originalPrice > course.price && (
              <span className="text-neutral-400 line-through text-[11px] font-normal">
                ${course.originalPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 stroke-current stroke-[1.8]" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a.5.5 0 00.71 0L21.75 8" />
            </svg>
            <span>{course.difficulty}</span>
          </div>
        </div>

        <Link
          href={coursePath}
          className="mt-3 px-3.5 py-1.5 border border-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg hover:bg-neutral-50 transition-colors"
        >
          Details
        </Link>
      </div>

    </div>
  );
}

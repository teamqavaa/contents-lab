"use client";

import Link from "next/link";

import { resolveThumbnail } from "@/lib/student/image";
import AddToCartButton from "./AddToCartButton";
import type { CourseItem } from "./types";

interface CourseCardProps {
  course: CourseItem;
  hrefBase: string;
  onToggleFavorite?: (id: number) => void;
}

export default function CourseCard({ course, hrefBase, onToggleFavorite }: CourseCardProps) {
  const coursePath = `${hrefBase}/${course.slug}`;

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition-shadow hover:shadow-md">
      <div>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
          <Link href={coursePath} className="relative block h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveThumbnail(course.image)}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          <div className="pointer-events-none absolute left-3 top-3 z-10">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-900 backdrop-blur-md">
              {course.badge}
            </span>
          </div>

          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(course.id);
              }}
              aria-label="Favorite"
              className="absolute right-3 top-3 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/80 text-neutral-700 shadow-xs backdrop-blur-md transition-colors hover:bg-white hover:text-red-500"
            >
              <svg
                className={`h-4 w-4 ${course.isFavorite ? "fill-red-500 stroke-red-500" : "fill-none stroke-current stroke-[2]"}`}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.575-4.688-4.575-1.742 0-3.262.908-4.312 2.29C10.95 4.583 9.43 3.675 7.688 3.675 5.099 3.675 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-600">{course.orgName}</span>
          </div>

          <Link href={coursePath}>
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-neutral-900 transition-colors hover:text-blue-600">
              {course.title}
            </h3>
          </Link>

          <p className="line-clamp-2 text-xs leading-relaxed text-neutral-500">{course.description}</p>
        </div>
      </div>

      <div className="mt-2 border-t border-neutral-100 p-5 pt-0">
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-3 text-xs font-medium text-neutral-500">
            <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
              <svg className="h-3.5 w-3.5 stroke-neutral-500 stroke-[1.8]" fill="none" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.659A2.25 2.25 0 009.568 3z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
              <span>
                {course.price === 0 ? (
                  <span className="font-bold text-emerald-600">Free</span>
                ) : (
                  `$${course.price}`
                )}
              </span>
              {course.originalPrice && course.originalPrice > course.price && (
                <span className="text-[11px] font-normal text-neutral-400 line-through">
                  ${course.originalPrice}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 stroke-current stroke-[1.8]" fill="none" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18L9 11.25l4.306 4.307a.5.5 0 00.71 0L21.75 8"
                />
              </svg>
              <span>{course.difficulty}</span>
            </div>
          </div>

          <AddToCartButton courseId={course.id} />
        </div>

        <div className="mt-3 flex justify-end">
          <Link
            href={coursePath}
            className="rounded-lg border border-neutral-200 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}

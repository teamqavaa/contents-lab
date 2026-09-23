"use client";

import { useState } from "react";
import Image from "next/image";

interface CourseHeaderCardProps {
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string | null;
  category: string | null;
  level: string;
  language: string;
  promoVideoUrl: string | null;
}

export default function CourseHeaderCard({
  title,
  subtitle,
  description,
  thumbnail,
  category,
  level,
  language,
  promoVideoUrl,
}: CourseHeaderCardProps) {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const hasPromo = Boolean(promoVideoUrl);
  const badge = [category ?? level, level, language].filter(Boolean).join(" · ");

  return (
    <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-900 font-mono shadow-md sm:aspect-video">
      {isPlayingVideo && hasPromo ? (
        <iframe
          src={`${promoVideoUrl}?autoplay=1`}
          title={title}
          className="relative h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          {thumbnail && (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />

          {hasPromo && (
            <button
              type="button"
              onClick={() => setIsPlayingVideo(true)}
              className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-white sm:h-20 sm:w-20"
              aria-label="Play promo video"
            >
              <svg className="ml-1 h-8 w-8 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
        </>
      )}

      {!isPlayingVideo && (
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 sm:p-10">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/30 bg-white/20 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm backdrop-blur-md">
              {badge}
            </span>
          </div>

          <div className="flex max-w-3xl flex-col gap-2.5 rounded-2xl border border-white/10 bg-black/40 p-5 shadow-lg backdrop-blur-md sm:p-6">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-white drop-shadow-sm sm:text-3xl">
              {title}
            </h1>
            <p className="line-clamp-2 text-xs leading-relaxed text-neutral-200 drop-shadow-xs sm:text-sm">
              {subtitle || description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
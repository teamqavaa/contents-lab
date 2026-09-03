'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CourseDetails } from '@/actions/courseDetail';

interface CourseHeaderCardProps {
  course: CourseDetails;
}

export default function CourseHeaderCard({ course }: CourseHeaderCardProps) {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-video rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-200 shadow-md font-mono group">
      {/* 1. Média de fond (Vidéo Iframe ou Miniature) */}
      {isPlayingVideo && course.promo_video_url ? (
        <iframe
          src={`${course.promo_video_url}?autoplay=1`}
          title={course.title}
          className="w-full h-full border-0 relative"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          <Image
            src={course.thumbnail || '/images/default-course.jpg'}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority
          />

          {/* Dégradé sombre pour garantir la lisibilité du texte */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />

          {/* Bouton Play au centre */}
          <button
            type="button"
            onClick={() => setIsPlayingVideo(true)}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 text-neutral-900 flex items-center justify-center shadow-xl backdrop-blur-md hover:bg-white hover:scale-110 transition-all cursor-pointer"
            aria-label="Play promo video"
          >
            <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </>
      )}

      {/* 2. Informations en surbrillance superposées (Masquées pendant la lecture vidéo) */}
      {!isPlayingVideo && (
        <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between pointer-events-none">
          {/* En-tête : Catégorie & Niveau */}
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold tracking-wider uppercase shadow-sm">
              {course.category_details.name} &nbsp;·&nbsp; {course.level}
            </span>
          </div>

          {/* Pied : Titre & Description en surbrillance */}
          <div className="flex flex-col gap-2.5 max-w-3xl bg-black/40 backdrop-blur-md border border-white/10 p-5 sm:p-6 rounded-2xl shadow-lg">
            <h1 className="text-xl sm:text-3xl font-bold text-white leading-tight tracking-tight drop-shadow-sm">
              {course.title}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed line-clamp-2 drop-shadow-xs">
              {course.subtitle || course.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

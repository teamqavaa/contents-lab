"use client";

import Image from 'next/image';
import { Course } from '@/actions/courses';

interface CourseCardProps {
  course: Course & {
    description?: string;
  };
}

export default function CourseCard({ course }: CourseCardProps) {
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

      {/* 1. Image du cours (Plein cadre) */}
      <div className="relative w-full aspect-[16/10] bg-neutral-100">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
        />
      </div>

      {/* Conteneur de contenu avec flex-1 pour aligner le bas */}
      <div className="flex flex-col flex-1 p-5">

        {/* 2. Métadonnées (Durée, Leçons/Avis, Note) */}
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 mb-3">
          {/* Durée */}
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 stroke-current stroke-[2]" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{duration}</span>
          </div>

          {/* Nombre de cours / avis */}
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 stroke-current stroke-[2]" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            </svg>
            <span>{lessonsCount} Leçons</span>
          </div>

          {/* Note / Rating */}
          <div className="flex items-center gap-1 text-neutral-900 font-bold">
            <span className="text-amber-400">★</span>
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* 3. Titre du cours (Réduit avec text-base & tronqué sur 1 ligne) */}
        <h3 className="text-base font-bold text-neutral-900 mb-2 line-clamp-1">
          {title}
        </h3>

        {/* 4. Description complète venant de l'API (Limitée à 2 lignes) */}
        {description && (
          <p className="text-xs text-neutral-500 mb-4 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* 5. Bas de carte : Prix à gauche & Bouton ADD TO CART unique à droite */}
        <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
          {/* Prix & Prix Barré */}
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

          {/* Bouton unique ADD TO CART */}
          <button
            type="button"
            onClick={() => alert(`Ajout du cours ${id} au panier`)}
            className="shrink-0 inline-flex items-center justify-center py-2.5 px-4 bg-black text-white rounded-full font-bold text-xs tracking-wider uppercase transition-colors hover:bg-neutral-800 cursor-pointer"
          >
            ADD TO CART
          </button>
        </div>

      </div>
    </div>
  );
}

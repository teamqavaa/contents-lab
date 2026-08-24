'use client';

import Link from 'next/link';

export default function CtaSection() {
  return (
    <section className="w-full bg-[#f3f3f3] py-16 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">

        {/* Banner Conteneur Sombre */}
        <div className="relative overflow-hidden bg-black rounded-3xl p-10 md:p-16 lg:p-20 border border-neutral-800 shadow-xl">

          {/* Motif Quadrillé en arrière-plan (Grid Pattern CSS) */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, #ffffff 1px, transparent 1px),
                linear-gradient(to bottom, #ffffff 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Contenu Centré */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-3xl mx-auto gap-6 ">

            {/* Titre principal */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Your future in tech starts this cohort.
            </h2>

            {/* Description */}
            <p className="text-neutral-400 text-base md:text-lg font-normal leading-relaxed max-w-2xl">
              Eight weeks of hands-on labs, mentor reviews and a project you defend in public. Seats for Cohort 04 are limited.
            </p>

            {/* Bouton d'Action */}
            <div className="mt-2">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-white text-black hover:bg-neutral-200 font-semibold text-sm py-4 px-8 rounded-full transition-all duration-200 transform hover:scale-[1.02]"
              >
                Sign Up Free
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

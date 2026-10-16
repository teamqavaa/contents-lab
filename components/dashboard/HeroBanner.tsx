import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/** Bannière d'accueil du dashboard. */
export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#6d5deb] px-6 py-8 md:px-8 md:py-10 text-white">
      {/* Étoiles décoratives */}
      <svg className="absolute right-6 top-2 h-40 w-40 text-white/25" viewBox="0 0 100 100" aria-hidden="true">
        <path fill="currentColor" d="M50 0 C52 40 60 48 100 50 C60 52 52 60 50 100 C48 60 40 52 0 50 C40 48 48 40 50 0Z" />
      </svg>
      <svg className="absolute right-40 bottom-0 h-24 w-24 text-white/15" viewBox="0 0 100 100" aria-hidden="true">
        <path fill="currentColor" d="M50 0 C52 40 60 48 100 50 C60 52 52 60 50 100 C48 60 40 52 0 50 C40 48 48 40 50 0Z" />
      </svg>

      <p className="relative text-xs font-semibold tracking-[0.25em] uppercase text-white/85">Online course</p>
      <h1 className="relative mt-3 max-w-lg text-2xl md:text-4xl font-bold leading-tight tracking-tight">
        Sharpen Your Skills with Professional Online Courses
      </h1>
      <Link
        href="/courses"
        className="relative mt-6 inline-flex items-center gap-3 rounded-full bg-neutral-900 py-2 pl-5 pr-2 text-sm font-medium hover:bg-black transition-colors"
      >
        Join Now
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-neutral-900">
          <ChevronRight className="w-4 h-4" />
        </span>
      </Link>
    </section>
  );
}

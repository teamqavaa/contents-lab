// components/banner/Banner.tsx — bannière de la page d'accueil (visiteurs)
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, GraduationCap, MonitorSmartphone, Sparkles, Video, Zap } from 'lucide-react';

import { getPublishedCourses } from '@/actions/catalog';

const AVATARS = ['/ceo.jpg', '/career.jpg', '/tutors.jpg'];

function compact(value: number) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

/**
 * Titre, appels à l'action et preuve sociale à gauche, grande photo avec badges flottants à droite.
 * Les chiffres (cours publiés, apprenants inscrits, catégories) viennent de courses-api.
 */
export default async function Banner() {
  const courses = await getPublishedCourses();
  const students = courses.reduce((total, course) => total + (course.total_students || 0), 0);
  const categories = new Set(courses.map((course) => course.category_details?.name).filter(Boolean)).size;

  return (
    <section className="relative w-full overflow-hidden bg-white px-4 pb-16 pt-28 md:px-10 md:pt-36">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        {/* Texte */}
        <div className="flex flex-col items-start">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-neutral-200 bg-white py-1.5 pl-1.5 pr-4 text-sm text-neutral-700 shadow-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lime-300 text-neutral-900">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            Online courses for every level &amp; goal
          </span>

          <h1 className="mt-7 text-[44px] font-extrabold leading-[1.05] tracking-tight text-neutral-900 sm:text-6xl lg:text-[68px]">
            Build
            <span className="mx-3 inline-flex h-[0.9em] w-[0.9em] -rotate-6 items-center justify-center rounded-xl bg-neutral-900 align-[-0.08em] text-white">
              <Zap className="h-[0.55em] w-[0.55em] fill-current" aria-hidden="true" />
            </span>
            <span className="text-[#2f5d50]">Skills</span>
            <br />
            <span className="text-orange-400">Online</span> with Real
            <br />
            Experts
            <span className="relative ml-4 inline-block h-[0.85em] w-[1.9em] overflow-hidden rounded-full align-[-0.05em] ring-4 ring-lime-200">
              <Image src="/ceo.jpg" alt="" fill sizes="140px" className="object-cover" />
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-neutral-500">
            Qavaa Innovate gives you a complete learning experience that helps you gain real, job-ready skills and
            take the next step in your career.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="btn btn-dark btn-lg shadow-lg shadow-neutral-900/20"
            >
              Start Learning <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/career-tracks"
              className="btn btn-secondary btn-lg"
            >
              Explore Career Tracks
            </Link>
          </div>

          {courses.length > 0 && (
            <div className="mt-11 flex items-center gap-4">
              <div className="flex -space-x-3">
                {AVATARS.map((src) => (
                  <span key={src} className="relative h-12 w-12 overflow-hidden rounded-full border-[3px] border-white">
                    <Image src={src} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                ))}
              </div>
              <p className="text-lg text-neutral-800">
                {students > 0 ? (
                  <>
                    <strong className="text-2xl font-bold">{compact(students)}+</strong> students enrolled
                  </>
                ) : (
                  <>
                    <strong className="text-2xl font-bold">{courses.length}</strong> courses available
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Visuel */}
        <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
          <div className="absolute -left-6 top-6 z-10 hidden h-20 w-20 items-center justify-center rounded-2xl border border-orange-100 bg-white text-orange-400 shadow-xl sm:flex">
            <Video className="h-9 w-9" aria-hidden="true" />
          </div>

          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[32px] bg-neutral-100 sm:ml-10 sm:w-[calc(100%-2.5rem)]">
            <Image
              src="/tutors.jpg"
              alt="A student following an online lesson with his teacher"
              fill
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover object-[70%_center]"
            />

            {courses.length > 0 && (
              <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 py-1.5 pl-1.5 pr-4 text-sm text-neutral-800 shadow">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-300">
                  <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                {courses.length} expert-led courses{categories > 1 ? ` · ${categories} topics` : ''}
              </span>
            )}

            <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-white/95 py-1.5 pl-1.5 pr-4 text-sm text-neutral-800 shadow">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-300">
                <MonitorSmartphone className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              Learn anytime, on any device
            </span>
          </div>

          <div className="absolute -bottom-5 -right-3 hidden h-24 w-24 items-center justify-center rounded-full border border-neutral-100 bg-white shadow-xl sm:flex">
            <GraduationCap className="h-11 w-11 text-violet-500" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

// app/(main)/career-tracks/page.tsx — parcours métier : chaque cours publié sert de « career track »
import type { Metadata } from 'next';

import { getPublishedCourses, searchCourses } from '@/actions/catalog';
import CareerTracksExplorer from '@/components/career-tracks/CareerTracksExplorer';
import type { TrackSummary } from '@/components/career-tracks/types';
import { courseTotals } from '@/lib/curriculum';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Career tracks · Ignite',
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function CareerTracksPage({ searchParams }: Props) {
  // ?q= : recherche du header (ou lien partagé), résolue par l'API de recherche de courses-api
  const query = ((await searchParams).q ?? '').trim();
  const [courses, search] = await Promise.all([
    getPublishedCourses(),
    query.length >= 2 ? searchCourses(query, 50) : Promise.resolve(null),
  ]);
  const tracks: TrackSummary[] = courses.map((course) => {
    const totals = courseTotals(course);
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.subtitle || course.description,
      thumbnail: course.thumbnail,
      category: course.category_details?.name || 'Other',
      level: course.level,
      modules: totals.modules,
      lessons: totals.lessons,
      minutes: totals.minutes,
    };
  });

  return (
    <main className="min-h-screen bg-[#f8f9fb] px-4 pb-20 pt-24 md:px-10 md:pt-32">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#4f3fd6]">Career tracks</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            Pick a path, follow it step by step
          </h1>
          <p className="mt-3 text-neutral-600">
            Every track is a complete course split into ordered modules. Open its learning path to see each step.
          </p>
        </header>
        {/* key : une nouvelle recherche depuis le header réinitialise les filtres */}
        <CareerTracksExplorer
          key={query}
          tracks={tracks}
          initialQuery={query}
          initialMatches={search ? search.results.map((result) => result.id) : null}
        />
      </div>
    </main>
  );
}

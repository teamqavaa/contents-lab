'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Info, Layers, Loader2, Route, Search, TrendingUp } from 'lucide-react';

import { searchCourses } from '@/actions/catalog';

import { capitalize, formatMinutes, plural } from '@/lib/format';
import { TRACK_TYPES } from '@/lib/curriculum';
import type { TrackSummary } from './types';

const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced', 'all'];
const SEARCH_LIMIT = 50;
const DEBOUNCE_MS = 250;

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function Checkbox({ label, hint, checked, onChange }: { label: string; hint?: string | number; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5 text-[15px] text-neutral-800">
      <span className="flex items-center gap-3">
        <input type="checkbox" checked={checked} onChange={onChange} className="h-[18px] w-[18px] rounded border-neutral-400 accent-neutral-900" />
        {label}
      </span>
      {hint !== undefined && <span className="text-sm text-neutral-500">{hint}</span>}
    </label>
  );
}

/**
 * Filtres (recherche, type de parcours, difficulté, catégories) + grille des parcours.
 * La recherche passe par l'API (GET /api/courses/search/) : elle couvre aussi le formateur,
 * les tags, les modules et les leçons. `initialMatches` = résultats déjà calculés pour ?q=.
 */
export default function CareerTracksExplorer({
  tracks,
  initialQuery = '',
  initialMatches = null,
}: {
  tracks: TrackSummary[];
  initialQuery?: string;
  initialMatches?: string[] | null;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [matches, setMatches] = useState<Set<string> | null>(initialMatches ? new Set(initialMatches) : null);
  const [searching, setSearching] = useState(false);
  const lastSearched = useRef(initialMatches ? initialQuery.trim() : '');
  const [types, setTypes] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const levelOptions = useMemo(
    () => [...new Set(tracks.map((t) => t.level))].sort((a, b) => LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b)),
    [tracks],
  );
  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>();
    tracks.forEach((t) => counts.set(t.category, (counts.get(t.category) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [tracks]);

  useEffect(() => {
    const q = query.trim();
    // URL partageable, sans recharger la page
    window.history.replaceState(null, '', q ? `/career-tracks?q=${encodeURIComponent(q)}` : '/career-tracks');
    if (q.length < 2 || q === lastSearched.current) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const response = await searchCourses(q, SEARCH_LIMIT);
      if (cancelled) return;
      lastSearched.current = q;
      setMatches(new Set(response.results.map((result) => result.id)));
      setSearching(false);
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const onQueryChange = (value: string) => {
    setQuery(value);
    const q = value.trim();
    if (q.length < 2) {
      lastSearched.current = '';
      setMatches(null);
      setSearching(false);
    } else {
      setSearching(q !== lastSearched.current);
    }
  };

  const filtered = tracks.filter((track) => {
    if (matches && !matches.has(track.id)) return false;
    if (types.length && !TRACK_TYPES.some((type) => types.includes(type.value) && type.match(track.minutes))) return false;
    if (levels.length && !levels.includes(track.level)) return false;
    if (categories.length && !categories.includes(track.category)) return false;
    return true;
  });

  const hasFilters = Boolean(matches || types.length || levels.length || categories.length);
  const reset = () => {
    onQueryChange('');
    setTypes([]);
    setLevels([]);
    setCategories([]);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
      <aside className="flex flex-col gap-7" aria-label="Filters">
        <div className="relative">
          {searching ? (
            <Loader2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-400" aria-hidden="true" />
          ) : (
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
          )}
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search courses, topics, instructors"
            aria-label="Search career tracks"
            className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-11 pr-4 text-sm focus:border-neutral-400 focus:outline-none"
          />
        </div>

        <fieldset>
          <legend className="mb-2 flex items-center gap-1.5 font-bold text-neutral-900">
            Course Type
            <span title="Based on the total duration of the track's lessons" className="text-neutral-400">
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </legend>
          {TRACK_TYPES.map((type) => (
            <Checkbox
              key={type.value}
              label={type.label}
              hint={type.hint}
              checked={types.includes(type.value)}
              onChange={() => setTypes(toggle(types, type.value))}
            />
          ))}
        </fieldset>

        {levelOptions.length > 0 && (
          <fieldset>
            <legend className="mb-2 font-bold text-neutral-900">Difficulty</legend>
            {levelOptions.map((level) => (
              <Checkbox
                key={level}
                label={level === 'all' ? 'All levels' : capitalize(level)}
                checked={levels.includes(level)}
                onChange={() => setLevels(toggle(levels, level))}
              />
            ))}
          </fieldset>
        )}

        {categoryOptions.length > 0 && (
          <fieldset>
            <legend className="mb-2 font-bold text-neutral-900">Popular Topics</legend>
            {categoryOptions.map(([name, count]) => (
              <Checkbox
                key={name}
                label={name}
                hint={count}
                checked={categories.includes(name)}
                onChange={() => setCategories(toggle(categories, name))}
              />
            ))}
          </fieldset>
        )}

        {hasFilters && (
          <button type="button" onClick={reset} className="w-fit text-sm text-neutral-600 underline underline-offset-4">
            Reset all filters
          </button>
        )}
      </aside>

      <section aria-labelledby="tracks-title">
        <h2 id="tracks-title" className="mb-5 text-2xl font-bold text-neutral-900">
          {hasFilters ? `${filtered.length} track${filtered.length === 1 ? '' : 's'} found` : 'All tracks'}
          {matches && <span className="ml-2 text-base font-normal text-neutral-500">for “{query.trim()}”</span>}
        </h2>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
            {tracks.length === 0 ? 'No career track is published yet.' : 'No track matches these filters.'}
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((track) => (
              <li key={track.id} className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <div className="relative h-48 bg-gradient-to-br from-neutral-800 to-neutral-600">
                  {track.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element -- miniatures servies par courses-api
                    <img src={track.thumbnail} alt="" className="h-full w-full object-cover" />
                  )}
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-sm font-medium text-neutral-900">
                    {track.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-neutral-500">
                    <Layers className="h-4 w-4" aria-hidden="true" />
                    {plural(track.modules, 'module')} · {plural(track.lessons, 'lesson')}
                    {track.minutes > 0 && ` · ${formatMinutes(track.minutes)}`}
                  </p>
                  <h3 className="mt-3 text-lg font-bold leading-snug text-neutral-900">{track.title}</h3>
                  <p className="mb-6 mt-3 line-clamp-2 text-sm text-neutral-500">{track.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
                    <span className="flex min-w-0 items-center gap-1.5 text-sm text-neutral-600">
                      <TrendingUp className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{track.level === 'all' ? 'All levels' : capitalize(track.level)}</span>
                    </span>
                    <Link
                      href={`/career-tracks/${track.slug}`}
                      className="btn btn-secondary btn-sm"
                    >
                      <Route className="h-4 w-4" aria-hidden="true" /> Learning path
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

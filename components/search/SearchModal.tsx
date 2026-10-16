'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Loader2, Route, Search } from 'lucide-react';

import { searchCourses, type CourseSearchResult } from '@/actions/catalog';
import { capitalize, plural } from '@/lib/format';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEBOUNCE_MS = 250;
const MAX_SUGGESTIONS = 6;

function careerTracksSearchHref(query: string) {
  return `/career-tracks?q=${encodeURIComponent(query.trim())}`;
}

/**
 * Recherche du header : suggestions en direct depuis courses-api (GET /api/courses/search/).
 * Entrée ouvre la page career-tracks filtrée sur la recherche (ou la suggestion sélectionnée).
 */
export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CourseSearchResult[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Recherche différée : une requête par pause de frappe, les réponses périmées sont ignorées
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const response = await searchCourses(q, MAX_SUGGESTIONS);
      if (cancelled) return;
      setResults(response.results);
      setCount(response.count);
      setActive(-1);
      setLoading(false);
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  if (!isOpen) return null;

  const onQueryChange = (value: string) => {
    setQuery(value);
    const short = value.trim().length < 2;
    setLoading(!short);
    if (short) {
      setResults([]);
      setCount(0);
    }
  };

  const close = () => {
    setQuery('');
    onClose();
  };

  const go = (href: string) => {
    close();
    router.push(href);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (active >= 0 && results[active]) return go(`/career-tracks/${results[active].slug}`);
    if (query.trim()) go(careerTracksSearchHref(query));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    }
  };

  const trimmed = query.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20" role="dialog" aria-modal="true" aria-label="Search courses">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />

      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl">
        <form onSubmit={onSubmit} className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3">
          {loading ? (
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-neutral-400" aria-hidden="true" />
          ) : (
            <Search className="h-5 w-5 shrink-0 text-neutral-400" aria-hidden="true" />
          )}
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search courses, topics, instructors…"
            aria-label="Search courses"
            aria-controls="search-results"
            aria-activedescendant={active >= 0 ? `search-result-${active}` : undefined}
            className="w-full bg-transparent text-base text-neutral-900 placeholder-neutral-400 outline-none"
          />
          <button type="button" onClick={close} className="btn btn-secondary btn-sm">
            Esc
          </button>
        </form>

        {trimmed.length >= 2 && (
          <div id="search-results" role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
            {!loading && results.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-neutral-500">No course matches “{trimmed}”.</p>
            )}
            {results.map((course, index) => (
              <Link
                key={course.id}
                id={`search-result-${index}`}
                role="option"
                aria-selected={index === active}
                href={`/career-tracks/${course.slug}`}
                onClick={close}
                onMouseEnter={() => setActive(index)}
                className={`flex items-center gap-3 rounded-[var(--radius-btn)] p-2 ${index === active ? 'bg-neutral-100' : ''}`}
              >
                <span className="h-12 w-16 shrink-0 overflow-hidden rounded bg-neutral-200">
                  {course.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element -- miniatures servies par courses-api
                    <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-neutral-900">{course.title}</span>
                  <span className="block truncate text-xs text-neutral-500">
                    {[course.category_details?.name, capitalize(course.level), plural(course.lessons_count, 'lesson'), course.instructor_name]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                <Route className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}

        {trimmed.length >= 2 && (
          <button
            type="button"
            onClick={() => go(careerTracksSearchHref(query))}
            className="flex w-full items-center justify-between border-t border-neutral-100 px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-neutral-50"
          >
            {count > results.length ? `See all ${count} results in career tracks` : 'Open in career tracks'}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

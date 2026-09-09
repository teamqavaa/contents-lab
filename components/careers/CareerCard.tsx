'use client';

import Link from 'next/link';

const CAREER_ICONS: Record<string, string> = {
  backend: '🛠',
  frontend: '🖥',
  data: '📊',
  cloud: '☁️',
  security: '🔒',
  mobile: '📱',
  git: '🔀',
  api: '🔌',
  sql: '🗄',
  cli: '⌨️',
  docker: '🐳',
  'data-viz': '📈',
  testing: '🧪',
};

interface CareerCardProps {
  slug: string;
  title: string;
  description: string | null;
  icon: string;
  duration_weeks: number;
  pace: string;
  includes_certificate: boolean;
  course_count: number;
}

export default function CareerCard({
  slug,
  title,
  description,
  icon,
  duration_weeks,
  pace,
  includes_certificate,
  course_count,
}: CareerCardProps) {
  const emoji = CAREER_ICONS[icon] || '💼';

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition-shadow hover:shadow-md">
      <div>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center">
          <Link href={`/learning-paths/${slug}`} className="relative block h-full w-full flex items-center justify-center">
            <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{emoji}</span>
          </Link>

          <div className="pointer-events-none absolute left-3 top-3 z-10">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-900 backdrop-blur-md">
              Career Path
            </span>
          </div>

          {includes_certificate && (
            <div className="pointer-events-none absolute right-3 top-3 z-10">
              <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                Certificate
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 p-5">
          <Link href={`/learning-paths/${slug}`}>
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-neutral-900 transition-colors hover:text-blue-600">
              {title}
            </h3>
          </Link>

          <p className="line-clamp-2 text-xs leading-relaxed text-neutral-500">
            {description || 'A guided career path to help you break into a new role.'}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-neutral-100 p-5 pt-0">
        <div className="flex items-center gap-3 pt-3 text-xs font-medium text-neutral-500">
          <span>{course_count} courses</span>
          <span className="text-neutral-300">·</span>
          <span>{duration_weeks} weeks</span>
          <span className="text-neutral-300">·</span>
          <span>{pace}</span>
        </div>

        <Link
          href={`/learning-paths/${slug}`}
          className="mt-3 rounded-lg border border-neutral-200 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
        >
          View Path
        </Link>
      </div>
    </div>
  );
}

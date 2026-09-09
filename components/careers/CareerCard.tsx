'use client';

import Link from 'next/link';
import type { CareerPath } from '@/actions/careers';

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
  career: CareerPath;
  onToggleFavorite?: (slug: string) => void;
}

export default function CareerCard({ career, onToggleFavorite }: CareerCardProps) {
  const emoji = CAREER_ICONS[career.icon] || '💼';
  const careerPath = `/learning-paths/${career.slug}`;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group">
      <div>
        <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-[#0f172a] to-[#1e293b] overflow-hidden">
          <Link href={careerPath} className="block relative w-full h-full flex items-center justify-center">
            <span className="text-6xl transition-transform duration-300 group-hover:scale-110">{emoji}</span>
          </Link>

          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span className="bg-white/90 backdrop-blur-md text-neutral-900 text-xs font-semibold px-3 py-1 rounded-full">
              Career Path
            </span>
          </div>

          {career.includes_certificate && (
            <div className="absolute top-3 right-3 z-10 pointer-events-none">
              <span className="bg-emerald-500/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                Certificate
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col gap-3">
          <Link href={careerPath}>
            <h3 className="text-base font-bold text-neutral-900 leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
              {career.title}
            </h3>
          </Link>

          <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
            {career.description || 'A guided career path to help you break into a new role.'}
          </p>
        </div>
      </div>

      <div className="p-5 pt-0 flex items-center justify-between border-t border-neutral-100 mt-2">
        <div className="flex items-center gap-3 text-xs font-medium text-neutral-500 pt-3">
          <span>{career.course_count} courses</span>
          <span className="text-neutral-300">·</span>
          <span>{career.duration_weeks} weeks</span>
          <span className="text-neutral-300">·</span>
          <span>{career.pace}</span>
        </div>

        <Link
          href={careerPath}
          className="mt-3 px-3.5 py-1.5 border border-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg hover:bg-neutral-50 transition-colors"
        >
          View Path
        </Link>
      </div>
    </div>
  );
}

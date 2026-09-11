'use client';

import { LearningPathDetails } from '@/actions/careers';

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

interface LearningPathHeaderCardProps {
  path: LearningPathDetails;
}

export default function LearningPathHeaderCard({ path }: LearningPathHeaderCardProps) {
  const emoji = CAREER_ICONS[path.icon] || '💼';

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-neutral-200 shadow-md font-mono group">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <span className="text-7xl sm:text-8xl group-hover:scale-110 transition-transform duration-500">{emoji}</span>
      </div>

      <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold tracking-wider uppercase shadow-sm">
            {path.kind === 'career' ? 'Career Path' : 'Skill Path'} &nbsp;·&nbsp; {path.pace}
          </span>
          {path.includes_certificate && (
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/80 backdrop-blur-md border border-emerald-400/30 text-white text-xs font-semibold tracking-wider uppercase shadow-sm">
              Certificate
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2.5 max-w-3xl bg-black/40 backdrop-blur-md border border-white/10 p-5 sm:p-6 rounded-2xl shadow-lg">
          <h1 className="text-xl sm:text-3xl font-bold text-white leading-tight tracking-tight drop-shadow-sm">
            {path.title}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed line-clamp-2 drop-shadow-xs">
            {path.description}
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

import type { LearningStats } from '@/actions/dashboard';

const BAR_COLOR = '#6d5deb';
const BAR_COLOR_MUTED = '#d9d4fb';

function niceMax(value: number) {
  if (value <= 4) return 4;
  const step = Math.pow(10, Math.floor(Math.log10(value)));
  return Math.ceil(value / step) * step;
}

/**
 * Activité quotidienne : minutes de cours terminées par jour (une seule série, pas de légende).
 * Survol / focus d'une barre -> info-bulle avec la date, les minutes et les leçons.
 */
export default function ActivityChart({ activity }: { activity: LearningStats['activity'] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(0, ...activity.map((d) => d.minutes)));
  const ticks = [max, max / 2, 0];
  const best = activity.reduce((top, d, i) => (d.minutes > (activity[top]?.minutes ?? 0) ? i : top), 0);
  const label = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', opts);

  return (
    <figure className="rounded-3xl bg-[#f6f6fb] p-4">
      <figcaption className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-neutral-900">Learning activity</span>
        <span className="text-[11px] text-neutral-500">minutes / day</span>
      </figcaption>

      <div className="flex gap-2">
        {/* Axe Y discret */}
        <div className="flex h-32 flex-col justify-between text-[10px] text-neutral-400 tabular-nums">
          {ticks.map((t) => (
            <span key={t} className="leading-none">{Math.round(t)}</span>
          ))}
        </div>

        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 flex flex-col justify-between" aria-hidden="true">
            {ticks.map((t) => (
              <span key={t} className="border-t border-dashed border-neutral-200" />
            ))}
          </div>

          <ul className="relative flex h-32 items-end gap-[2px]" aria-label="Minutes learned per day">
            {activity.map((day, index) => {
              const height = max ? (day.minutes / max) * 100 : 0;
              const isActive = active === index;
              return (
                <li
                  key={day.date}
                  tabIndex={0}
                  onMouseEnter={() => setActive(index)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(index)}
                  onBlur={() => setActive(null)}
                  aria-label={`${label(day.date, { weekday: 'long', month: 'short', day: 'numeric' })}: ${day.minutes} minutes, ${day.lessons_completed} lessons`}
                  className="relative flex h-full flex-1 cursor-default items-end justify-center outline-none"
                >
                  <span
                    className="block w-full max-w-7 rounded-t-[4px] transition-colors"
                    style={{
                      height: `${Math.max(height, day.minutes ? 4 : 2)}%`,
                      backgroundColor: isActive || index === best ? BAR_COLOR : BAR_COLOR_MUTED,
                    }}
                  />
                  {isActive && (
                    <span
                      role="tooltip"
                      className="absolute bottom-full mb-2 z-10 whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1.5 text-[11px] text-white shadow-lg"
                    >
                      <span className="block font-semibold">{label(day.date, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      {day.minutes} min · {day.lessons_completed} lesson{day.lessons_completed === 1 ? '' : 's'}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-2 flex gap-[2px] text-[10px] text-neutral-400">
            {activity.map((day) => (
              <span key={day.date} className="flex-1 text-center">
                {label(day.date, { weekday: 'narrow' })}
              </span>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}

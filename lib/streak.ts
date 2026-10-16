// lib/streak.ts — séries de jours d'apprentissage à partir de l'activité quotidienne (courses-api /stats/)

interface DailyActivity {
  date: string;
  lessons_completed: number;
}

/** Série en cours (jours consécutifs actifs jusqu'à aujourd'hui ou hier) et plus longue série de la période. */
export function learningStreaks(activity: DailyActivity[]) {
  const days = [...activity].sort((a, b) => a.date.localeCompare(b.date));
  let longest = 0;
  let run = 0;
  for (const day of days) {
    run = day.lessons_completed > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  let current = 0;
  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (days[index].lessons_completed > 0) current += 1;
    else if (index === days.length - 1) continue; // aujourd'hui pas encore actif : la série d'hier compte
    else break;
  }
  return { current, longest };
}

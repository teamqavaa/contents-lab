// lib/format.ts — formatage des durées et dates affichées dans l'interface

/** 75 -> "1h 15m", 45 -> "45m", 0 -> "—" */
export function formatMinutes(minutes: number): string {
  if (!minutes || minutes <= 0) return '—';
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  if (hours && rest) return `${hours}h ${rest}m`;
  return hours ? `${hours}h` : `${rest}m`;
}

/** Date relative courte : "today", "yesterday", "3 days ago", "2 weeks ago". */
export function timeAgo(iso?: string | null): string {
  if (!iso) return '—';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (Number.isNaN(days)) return '—';
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export function capitalize(value?: string | null): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}

/** 1 -> "1 lesson", 3 -> "3 lessons" */
export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

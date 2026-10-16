// lib/video.ts — lecture des vidéos de courses-api (promo d'un cours) dans le navigateur
import { COURSES_API_URL } from './coursesApi';

export type VideoSource =
  | { kind: 'iframe'; src: string; provider: 'youtube' | 'vimeo' }
  | { kind: 'file'; src: string };

const YOUTUBE_ID = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/;
const VIMEO_ID = /vimeo\.com\/(?:video\/)?(\d+)/;

/**
 * Transforme l'URL saisie par l'instructeur (page YouTube `watch?v=`, youtu.be, Vimeo, fichier
 * mp4/webm ou chemin /media/…) en source lisible dans la page. Une page `watch?v=` ne peut pas
 * être affichée dans un iframe : il faut l'URL /embed/.
 *
 * `autoplay` lance la vidéo en muet : les navigateurs bloquent la lecture automatique avec le son.
 */
export function toVideoSource(url: string | null | undefined, { autoplay = false } = {}): VideoSource | null {
  const value = (url || '').trim();
  if (!value) return null;

  const youtube = value.match(YOUTUBE_ID);
  if (youtube) {
    const id = youtube[1];
    const params = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1' });
    if (autoplay) {
      params.set('autoplay', '1');
      params.set('mute', '1');
      // loop exige playlist=<id> pour une vidéo seule
      params.set('loop', '1');
      params.set('playlist', id);
    }
    return { kind: 'iframe', provider: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}?${params}` };
  }

  const vimeo = value.match(VIMEO_ID);
  if (vimeo) {
    const params = new URLSearchParams({ title: '0', byline: '0', portrait: '0' });
    if (autoplay) {
      params.set('autoplay', '1');
      params.set('muted', '1');
      params.set('loop', '1');
    }
    return { kind: 'iframe', provider: 'vimeo', src: `https://player.vimeo.com/video/${vimeo[1]}?${params}` };
  }

  // Fichier hébergé par courses-api (/media/…) ou URL directe d'un fichier vidéo
  return { kind: 'file', src: value.startsWith('/') ? `${COURSES_API_URL}${value}` : value };
}

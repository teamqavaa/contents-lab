// Vidéo de présentation d'un cours : lecture automatique (muette) dès l'arrivée sur la page
import { PlayCircle, VolumeX } from 'lucide-react';

import type { VideoSource } from '@/lib/video';

export default function PromoVideo({ source, poster, title }: { source: VideoSource | null; poster: string | null; title: string }) {
  return (
    <figure className="overflow-hidden rounded-xl bg-[#1e293b] shadow-lg">
      <div className="relative aspect-video w-full">
        {source?.kind === 'iframe' ? (
          <iframe
            src={source.src}
            title={`${title} — course preview`}
            className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : source?.kind === 'file' ? (
          <video
            src={source.src}
            poster={poster ?? undefined}
            className="absolute inset-0 h-full w-full bg-black object-contain"
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
          />
        ) : (
          <>
            {poster && (
              // eslint-disable-next-line @next/next/no-img-element -- miniature servie par courses-api
              <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-indigo-600">
                <PlayCircle className="h-8 w-8" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium">The preview video is coming soon</span>
            </div>
          </>
        )}
      </div>
      <figcaption className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs text-neutral-300">
        <span className="font-semibold text-white">Course preview</span>
        {source && (
          <span className="flex items-center gap-1.5">
            <VolumeX className="h-3.5 w-3.5" aria-hidden="true" /> Plays muted — turn the sound on in the player
          </span>
        )}
      </figcaption>
    </figure>
  );
}

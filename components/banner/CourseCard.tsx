// components/banner/CourseCard.tsx
import { Play } from 'lucide-react';

interface CourseCardProps {
  image: string;
  stat?: string | null;
  text?: string | null;
  author?: { name: string; title: string } | null;
  video: boolean;
}

export default function CourseCard({ image, stat, text, author, video }: CourseCardProps) {
  return (
    <div className="relative aspect-[4/3] rounded-[28px] overflow-hidden group shadow-lg">
      {/* Image de Fond de la Carte */}
      <img
        src={image}
        alt={author ? author.name : text || 'Course image'}
        className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-300"
      />

      {/* Overlay Sombre pour le Texte (Gradient de bas en haut) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />

      {/* Conteneur de Texte (En bas à gauche) */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-1 pr-6">
        {/* Cas : Carte avec Statistique (ex: 92%) */}
        {stat && text && (
          <>
            <span className="text-white text-4xl font-extrabold tracking-tight">{stat}</span>
            <span className="text-white text-lg font-semibold max-w-sm">{text}</span>
          </>
        )}

        {/* Cas : Carte avec Auteur (ex: Mark Jhongson) */}
        {author && (
          <>
            <span className="text-white text-xl font-bold">{author.name}</span>
            <span className="text-gray-100 text-xs font-medium">{author.title}</span>
          </>
        )}
      </div>

      {/* Bouton Play Vidéo (En bas à droite, si activé) */}
      {video && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center justify-center w-11 h-11 bg-white text-black rounded-full shadow-lg cursor-pointer transition-transform group-hover:scale-110">
          <Play size={18} fill="currentColor" />
        </div>
      )}
    </div>
  );
}

import Image from 'next/image';

export interface Testimonial {
  id: string;
  quote: string;
  author: {
    name: string;
    avatar: string;
    cohort: string;
    role: string;
  };
}

export default function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { quote, author } = testimonial;

  return (
    <div className="flex flex-col justify-between bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm min-h-[320px]">
      {/* 1. Icône Guillemets (Quotes) & Citation */}
      <div className="flex flex-col gap-5">
        {/* SVG Guillemets du design */}
        <div className="text-neutral-900">
          <svg className="w-8 h-8 fill-current text-blue-400" viewBox="0 0 32 32">
            <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H6c0-2.2 1.8-4 4-4V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-8c0-2.2 1.8-4 4-4V8z" />
          </svg>
        </div>

        {/* Texte du témoignage */}
        <p className="text-neutral-800 text-lg md:text-xl font-medium leading-relaxed">
          &quot;{quote}&quot;
        </p>
      </div>

      {/* 2. Profil de l'auteur (Avatar + Nom + Métier) */}
      <div className="flex items-center gap-3.5 mt-8 pt-4">
        {/* Avatar */}
        <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 bg-neutral-100">
          <Image
            src={author.avatar}
            alt={author.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Informations */}
        <div className="flex flex-col">
          <span className="text-base font-bold text-neutral-900 leading-snug">
            {author.name}
          </span>
          <span className="text-xs font-medium text-neutral-500">
            {author.cohort} · {author.role}
          </span>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';

interface SectionHeaderProps {
  subtitle?: string;
  title: string;
  linkText?: string;
  linkHref?: string;
}

export default function SectionHeader({
  subtitle = 'TRY BEFORE YOU COMMIT',
  title = 'Popular Courses',
  linkText = 'Browse all courses',
  linkHref = '/courses',
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-8">
      {/* Côté Gauche : Sur-titre + Titre Principal */}
      <div className="flex flex-col gap-2">
        {subtitle && (
          <span className="text-xs md:text-sm font-semibold tracking-widest text-neutral-500 uppercase">
            {subtitle}
          </span>
        )}
        <h2 className="text-4xl md:text-3xl lg:text-3xl font-extrabold text-neutral-900 tracking-tight">
          {title}
        </h2>
      </div>

      {/* Côté Droit : Lien d'action avec Flèche */}
      {linkText && linkHref && (
        <Link
          href={linkHref}
          className="group flex items-center gap-2 text-sm md:text-base font-semibold text-neutral-900 hover:text-neutral-600 transition-colors whitespace-nowrap self-start sm:self-end"
        >
          <span>{linkText}</span>
          {/* Icône Flèche */}
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 stroke-current stroke-[2] text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      )}
    </div>
  );
}

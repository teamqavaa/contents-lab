import Link from 'next/link';

/** Logo Ignite (même identité que l'en-tête mobile du site). */
export default function IgniteLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Ignite — home">
      <span className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-full">
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M13 2L3 14h7v8l10-12h-7V2z" />
        </svg>
      </span>
      <span className="font-extrabold tracking-tight text-xl text-neutral-900 uppercase">Ignite</span>
    </Link>
  );
}

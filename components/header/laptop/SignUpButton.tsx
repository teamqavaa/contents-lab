// components/header/SignUpButton.tsx
import Link from 'next/link';

export default function SignUpButton() {
  return (
    <Link
      href="/signup"
      className="group flex items-center gap-3 bg-blue-400 text-white pl-5 pr-1 py-1 rounded-full font-bold text-xs tracking-wider transition-all hover:bg-neutral-800"
    >
      <span>SIGN UP</span>
      <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full text-black transition-transform group-hover:translate-x-0.5">
        {/* Flèche droite */}
        <svg
          className="w-4 h-4 stroke-current stroke-[2]"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
          />
        </svg>
      </div>
    </Link>
  );
}

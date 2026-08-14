import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center justify-center w-10 h-10 bg-black rounded-full transition-transform hover:scale-105">
      {/* Icône Éclair / Flash SVG */}
      <span className='text-white text-2xl font-bold'>QI</span>
    </Link>
  );
}

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CtaButton() {
  return (
    <>
    <Link href="/courses">

    <button className="flex items-center gap-2 bg-blue-400 text-white px-7 py-3.5 rounded-full text-base font-bold tracking-tight shadow-lg shadow-gray-300 hover:bg-neutral-900 transition-all cursor-pointer">
      EXPLORE OUR COURSES
      {/* Icône de flèche */}
      <div className="flex items-center justify-center w-8 h-8 bg-white text-black rounded-full transition-transform hover:translate-x-1">
        <ArrowRight size={18} />
      </div>
    </button></Link>
    </>

  );
}

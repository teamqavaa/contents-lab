'use client';

import Link from 'next/link';

interface MobileCartButtonProps {
  itemCount?: number;
}

export default function MobileCartButton({ itemCount = 3 }: MobileCartButtonProps) {
  return (
    <Link
      href="/cart"
      aria-label="Voir le panier"
      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-200 transition-colors"
    >
      {/* Icône Panier / Caddie */}
      <svg
        className="w-5 h-5 stroke-current stroke-[2]"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.25 10.5a.75.75 0 100-1.5.75.75 0 000 1.5zm7.5 0a.75.75 0 100-1.5.75.75 0 000 1.5z"
        />
      </svg>

      {/* Badge indicateur de quantité */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-black dark:bg-white dark:text-black rounded-full animate-in zoom-in-50">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}

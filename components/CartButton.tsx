'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { getMyCart } from '@/actions/cart';

interface CartButtonProps {
  initialCount?: number;
  className?: string;
}

/** Panier de l'utilisateur connecté (courses-api) : icône + nombre d'articles, mis à jour sur « cartUpdate ». */
export default function CartButton({ initialCount = 0, className = '' }: CartButtonProps) {
  const [cartCount, setCartCount] = useState<number>(initialCount);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const cartData = await getMyCart();
        setCartCount(cartData ? Number(cartData.items_count) || cartData.items?.length || 0 : 0);
      } catch {
        setCartCount(0);
      }
    };

    fetchCartData();
    // Émis lors d'un ajout ou d'une suppression dans le panier
    window.addEventListener('cartUpdate', fetchCartData);
    return () => window.removeEventListener('cartUpdate', fetchCartData);
  }, []);

  return (
    <Link
      href="/carts"
      aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
      className={`btn btn-secondary btn-icon relative ${className}`}
    >
      <ShoppingCart className="w-[18px] h-[18px]" aria-hidden="true" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-emerald-500 px-1 text-[10px] font-bold text-white">
          {cartCount}
        </span>
      )}
    </Link>
  );
}

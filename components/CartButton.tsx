'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { CartResponse, getMyCart } from '@/actions/cart';

interface CartButtonProps {
  initialCount?: number;
}

export default function CartButton({ initialCount = 0 }: CartButtonProps) {
  const [cartCount, setCartCount] = useState<number>(initialCount);

  const fetchCartData = async () => {
    const cartData = await getMyCart();

    if (cartData) {
      const count = Number(cartData.items_count) || cartData.items?.length || 0;
      setCartCount(count);
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartData();

    const handleCartUpdate = () => fetchCartData();
    window.addEventListener('cartUpdate', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdate', handleCartUpdate);
    };
  }, []);

  return (
    <Link
      href="/carts"
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-black transition-colors rounded-full hover:bg-gray-100"
    >
      <div className="relative flex items-center justify-center">
        <ShoppingCart className="w-4 h-4" />
        <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center border border-white">
          {cartCount}
        </span>
      </div>
      <span>Cart</span>
    </Link>
  );
}

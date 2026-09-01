'use client';

import { useState, useEffect } from 'react';
import { getMyCart, removeFromCartAction } from '@/actions/cart'; // Importez l'action de suppression
import CartItemCard from './CartItemCard';
import CartSummary from './CartSummary';

interface CartData {
  id: string;
  items: any[];
  items_count: number;
  total_price: string;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const data = await getMyCart();
      setCart(data);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Logique connectée à l'API pour supprimer l'élément
  const handleRemoveItem = async (itemId: string) => {
    try {
      const result = await removeFromCartAction(itemId);
      if (result.success) {
        // Rafraîchir les données du panier après la suppression réussie
        await fetchCart();
      } else {
        console.error('Error removing item:', result.error);
      }
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="text-neutral-500 font-medium text-sm">Loading your cart...</span>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.total_price && !isNaN(parseFloat(cart.total_price)) ? parseFloat(cart.total_price).toFixed(2) : '0.00';

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen py-10 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Checkout</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
            Your cart
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-8 flex flex-col gap-4">
            {items.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-neutral-200/80 shadow-xs">
                <p className="text-neutral-500 text-sm font-medium">Your cart is empty.</p>
              </div>
            ) : (
              items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onRemove={handleRemoveItem}
                />
              ))
            )}
          </div>

          <div className="lg:col-span-4">
            <CartSummary subtotal={subtotal} totalPrice={subtotal} />
          </div>

        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { handleCheckoutAction } from '@/actions/checkout'; // Ajustez le chemin selon votre structure

interface CartSummaryProps {
  subtotal: string;
  totalPrice: string;
}

export default function CartSummary({ subtotal, totalPrice }: CartSummaryProps) {
  const [promoCode, setPromoCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formattedSubtotal = !isNaN(parseFloat(subtotal)) ? parseFloat(subtotal).toFixed(2) : '0.00';
  const formattedTotal = !isNaN(parseFloat(totalPrice)) ? parseFloat(totalPrice).toFixed(2) : '0.00';

 const onCheckoutClick = async () => {
    setIsLoading(true);
    try {
      await handleCheckoutAction();
    } catch (error) {
      // Si Next.js fait une redirection, il lance une exception spéciale qu'on laisse passer
      console.error(error);
    } finally {
      // S'assure que le bouton se débloque quoiqu'il arrive
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm flex flex-col gap-6 sticky top-8">
      <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
        Order summary
      </h2>

      <div className="flex flex-col gap-3.5 text-sm">
        <div className="flex justify-between text-neutral-600">
          <span>Subtotal</span>
          <span className="font-semibold text-neutral-900">${formattedSubtotal}</span>
        </div>
        <div className="flex justify-between text-neutral-600">
          <span>Discount</span>
          <span className="font-semibold text-neutral-900">−$0.00</span>
        </div>
        <div className="flex justify-between text-neutral-600">
          <span>Taxes</span>
          <span className="font-semibold text-neutral-900">$0.00</span>
        </div>
      </div>

      <hr className="border-neutral-100" />

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
          Promo code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Enter code"
            className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors"
          />
          <button
            type="button"
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>

      <hr className="border-neutral-100" />

      <div className="flex justify-between items-center">
        <span className="text-base font-medium text-neutral-600">Total</span>
        <span className="text-2xl font-extrabold text-neutral-900">${formattedTotal}</span>
      </div>

      <button
        type="button"
        onClick={onCheckoutClick}
        disabled={isLoading}
        className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-semibold rounded-xl transition-colors shadow-sm cursor-pointer text-center disabled:opacity-50"
      >
        {isLoading ? "Processing..." : "Checkout"}
      </button>
    </div>
  );
}

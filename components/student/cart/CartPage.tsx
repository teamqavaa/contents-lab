"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ShoppingCart } from "lucide-react";

import CartItemRow from "./CartItemRow";
import CartSummary from "./CartSummary";
import { checkoutAction, fulfillPaymentAction } from "@/actions/student/orders";
import { initiatePaymentAction } from "@/actions/student/payments";
import type { Cart } from "@/actions/student/cart";

export default function CartPage({
  cart,
  error,
  hrefBase = "/browse-courses",
}: {
  cart: Cart | null;
  error: string | null;
  hrefBase?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const isEmpty = !cart || cart.items.length === 0;

  function proceedToCheckout() {
    setCheckoutError(null);
    startTransition(async () => {
      const checkout = await checkoutAction();
      if (!checkout.order) {
        setCheckoutError(checkout.error ?? "Checkout failed.");
        return;
      }
      const payment = await initiatePaymentAction(checkout.order.id);
      const tx = payment.payment?.transaction_reference;
      if (!tx) {
        setCheckoutError(payment.error ?? "Could not start payment.");
        return;
      }

      const fulfill = await fulfillPaymentAction(tx);
      if (!fulfill.ok) {
        setCheckoutError(fulfill.error ?? "Payment confirmation failed.");
        return;
      }

      router.push(`/qavaa?order_id=${encodeURIComponent(checkout.order.id)}`);
    });
  }

  const subtotal = cart?.total_price ?? "0";

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Checkout
          </span>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              Your cart
            </h1>
            <Link
              href={hrefBase}
              className="text-xs font-semibold text-blue-600 underline-offset-4 hover:underline"
            >
              Continue browsing
            </Link>
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 p-4 text-xs text-red-600">
            {error}. Cart could not be loaded.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-4">
            {isEmpty ? (
              <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 text-center border border-neutral-200/80 shadow-xs">
                <div className="flex size-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">Your cart is empty</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Browse courses and add something to get started.
                  </p>
                </div>
                <Link
                  href={hrefBase}
                  className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-neutral-700"
                >
                  Explore courses
                </Link>
              </div>
            ) : (
              cart.items.map((item) => (
                <CartItemRow key={item.id} item={item} hrefBase={hrefBase} />
              ))
            )}
          </div>

          {!isEmpty && (
            <div className="lg:col-span-4">
              <CartSummary
                subtotal={subtotal}
                totalPrice={subtotal}
                pending={pending}
                onCheckout={proceedToCheckout}
              />
              {checkoutError && <p className="mt-3 text-xs text-red-600">{checkoutError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
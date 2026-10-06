'use client';

import { initiatePayment } from "@/actions/checkout";
import { useState } from "react";

interface PaymentProvider {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  logo: string | null;
}

interface PaymentFormClientProps {
  orderId: string;
  initialProviders: PaymentProvider[];
  fetchError: string | null;
}

export default function PaymentFormClient({ orderId, initialProviders, fetchError }: PaymentFormClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(fetchError);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    formData.append("orderId", orderId);

    const result = await initiatePayment(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
          Select Payment Method
        </label>

        <div className="flex flex-col gap-2.5">
          {initialProviders.map((provider, index) => (
            <label
              key={provider.id}
              className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 cursor-pointer hover:border-black transition-colors"
            >
              <input
                type="radio"
                name="payment_method"
                value={provider.code}
                defaultChecked={index === 0}
                className="accent-black"
              />
              <span className="text-sm font-semibold text-neutral-800">{provider.name}</span>
            </label>
          ))}
          {initialProviders.length === 0 && (
            <p className="text-sm text-red-500">No active payment methods available.</p>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || initialProviders.length === 0}
        className="w-full py-3 px-4 bg-blue-400 hover:bg-blue-500 text-white font-medium rounded-md transition-colors disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Redirecting to payment..." : "Pay Now"}
      </button>
    </form>
  );
}

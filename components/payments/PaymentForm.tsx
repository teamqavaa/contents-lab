'use client';

import { initiatePayment } from "@/actions/checkout";
import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface PaymentProvider {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  logo: string | null;
}

interface PaymentFormProps {
  orderId: string;
}

export default function PaymentForm({ orderId }: PaymentFormProps) {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProviders() {
      try {
        console.log("Fetching from:", `${API_BASE_URL}/payment-providers/`);
        const response = await fetch(`${API_BASE_URL}/payment-providers/`);
        if (!response.ok) throw new Error("Erreur lors de la récupération des modes de paiement.");
        const data = await response.json();

        console.log("Données reçues :", data);

        // Filtrer explicitement
        const activeProviders = data.filter((p: PaymentProvider) => p.is_active === true);
        console.log("Actifs filtrés :", activeProviders);

        setProviders(activeProviders);
      } catch (err: any) {
        console.error("Erreur:", err);
        setError(err.message || "Impossible de charger les paiements.");
      } finally {
        setFetching(false);
      }
    }

    fetchProviders();
  }, []);

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

  if (fetching) {
    return <div className="text-sm text-neutral-500 py-4">Chargement des options de paiement...</div>;
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
          Select Payment Method
        </label>

        <div className="flex flex-col gap-2.5">
          {providers.map((provider, index) => (
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
          {providers.length === 0 && (
            <p className="text-sm text-red-500">Aucun moyen de paiement actif disponible.</p>
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
        disabled={loading || providers.length === 0}
        className="w-full py-3 px-4 bg-blue-400 hover:bg-blue-500 text-white font-medium rounded-md transition-colors disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Redirecting to payment..." : "Pay Now"}
      </button>
    </form>
  );
}

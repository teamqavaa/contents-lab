import { initiatePayment } from "@/actions/checkout";
import PaymentFormClient from "@/components/payments/PaymentFormClient";

interface PaymentProvider {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  logo: string | null;
}

interface PaymentFormProps {
  orderId: string;
  accessToken: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://contents-lab-api-5jbnazjbya-ew.a.run.app/api";

export default async function PaymentForm({ orderId }: { orderId: string }) {
  let providers: PaymentProvider[] = [];
  let fetchError: string | null = null;

  try {
    const response = await fetch(`${API_BASE_URL}/payment-providers/`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des modes de paiement.");
    }

    const data = await response.json();
    providers = data.filter((p: PaymentProvider) => p.is_active === true);
  } catch (err: any) {
    fetchError = err.message || "Impossible de charger les paiements.";
  }

  return <PaymentFormClient orderId={orderId} initialProviders={providers} fetchError={fetchError} />;
}

import PaymentForm from "@/components/payments/PaymentForm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function PaymentPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const orderId = params.orderId;

  if (!orderId) {
    redirect("/carts");
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const res = await fetch(`http://127.0.0.1:8080/api/orders/${orderId}/`, {
    headers: {
      Cookie: `access_token=${accessToken}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    redirect("/carts?error=order_not_found");
  }

  const order = await res.json();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 relative">
      {/* Bouton Back to Home en haut à gauche */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-neutral-900 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to home
        </Link>
      </div>

      <div className="w-full max-w-4xl p-6 sm:p-8 bg-white ">
        <h1 className="text-2xl font-bold mb-8 text-neutral-900 tracking-tight">Complete Your Payment</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Colonne de gauche : Informations de la commande */}
          <div className="flex flex-col gap-6">
            <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-100 flex flex-col gap-3.5">
              <h2 className="text-base font-semibold text-neutral-900">Order Summary</h2>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Order ID</span>
                <span className="font-mono font-medium text-neutral-800">#{order.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Items count</span>
                <span className="font-medium text-neutral-800">{order.items.length} courses</span>
              </div>
              <hr className="border-neutral-200" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-neutral-700">Total to pay</span>
                <span className="text-2xl font-extrabold text-neutral-900">{order.total_amount} {order.currency || 'USD'}</span>
              </div>
            </div>
          </div>

          {/* Colonne de droite : Méthodes de paiement et Bouton */}
          <div className="flex flex-col gap-6">


            {/* Formulaire de paiement contenant le bouton */}
            <PaymentForm orderId={order.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

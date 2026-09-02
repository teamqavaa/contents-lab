"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer/Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Vérifie si l'on se trouve sur la page de paiement
  const isPaymentPage = pathname?.startsWith("/checkout/payment");

  return (
    <>
      {!isPaymentPage && <Navbar />}
      <div className="w-full max-w-full overflow-x-clip relative flex-1">
        {children}
      </div>
      {!isPaymentPage && <Footer />}
    </>
  );
}

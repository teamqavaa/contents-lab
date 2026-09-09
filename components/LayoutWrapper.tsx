'use client';

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer/Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Vérifie si l'on se trouve sur la page de paiement ou sur la page d'apprentissage d'un cours
  const isPaymentPage = pathname?.startsWith("/checkout/payment");
  const isLearnPage = pathname?.includes("/learn");

  const hideHeaderFooter = isPaymentPage || isLearnPage;

  return (
    <>
      {!hideHeaderFooter && <Navbar />}
      <div className="w-full max-w-full overflow-x-clip relative flex-1">
        {children}
      </div>
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

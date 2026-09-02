"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function handleCheckoutAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return { success: false, error: "Utilisateur non authentifié." };
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "Cookie": `access_token=${token}`,
    };

    const CART_API_URL = process.env.NEXT_PUBLIC_CART_API_URL || "http://127.0.0.1:8080";

    const response = await fetch(`${CART_API_URL}/api/orders/checkout/`, {
      method: "POST",
      headers: headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.detail || data.message || "Erreur lors de la création de la commande.",
      };
    }

    // Redirection automatique gérée par Next.js vers la page de paiement
    redirect(`/checkout/payment?orderId=${data.id}`);

  } catch (error) {
    // Ne pas intercepter l'erreur de redirection interne de Next.js
    if ((error as Error)?.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Erreur dans handleCheckoutAction:", error);
    return {
      success: false,
      error: "Erreur réseau ou serveur inaccessible.",
    };
  }
}



export async function initiatePayment(formData: FormData) {
  const orderId = formData.get("orderId");
  const providerCode = formData.get("payment_method");

  if (!orderId || !providerCode) {
    return { error: "Missing order ID or payment method." };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  try {
    const res = await fetch("http://127.0.0.1:8080/api/payments/initiate/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      body: JSON.stringify({
        order_id: orderId,
        provider_code: providerCode,
      }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Failed to initialize payment.");
    }

    if (data.client_secret && data.client_secret.startsWith("http")) {
      redirect(data.client_secret);
    } else {
      redirect(`/payments/success?order_id=${orderId}&payment_id=${data.id}`);
    }
  } catch (err: any) {
    if (err.message === "NEXT_REDIRECT") {
      throw err;
    }
    return { error: err.message || "An unexpected error occurred." };
  }
}

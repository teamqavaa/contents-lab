'use server';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function handleCheckoutAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return { success: false, error: "User not authenticated." };
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "Cookie": `access_token=${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/orders/checkout/`, {
      method: "POST",
      headers: headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.detail || data.message || "Error while creating the order.",
      };
    }

    // Automatic redirection handled by Next.js to the payment page
    redirect(`/checkout/payment?orderId=${data.id}`);

  } catch (error) {
    if ((error as Error)?.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Error in handleCheckoutAction:", error);
    return {
      success: false,
      error: "Network error or server unreachable.",
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
    const res = await fetch(`${API_BASE_URL}/payments/initiate/`, {
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

export async function getOrderDetails(orderId: string) {
  if (!orderId) {
    return { success: false, error: "Missing order identifier." };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return { success: false, error: "User not authenticated." };
    }

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Cookie: `access_token=${token}`,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.detail || "Unable to retrieve order details.",
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error in getOrderDetails:", error);
    return {
      success: false,
      error: "Server error while retrieving the order.",
    };
  }
}

"use server";

import { cookies } from "next/headers";

import { COURSES_API_URL } from "@/lib/student/courses-api";

export type OrderItem = {
  id: number;
  price_paid: string;
  course: {
    id: string;
    title: string;
    price: string;
  };
};

export type Order = {
  id: string;
  user_id: string;
  status: string;
  total_amount: string;
  currency: string;
  items: OrderItem[];
};

export type CheckoutResult =
  | { order: Order; error: null }
  | { order: null; error: string };

type FulfillResult = { ok: boolean; error: string | null };

async function authHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function hasToken(headers: Record<string, string>): boolean {
  return Boolean(headers.Authorization);
}

// POST /api/orders/checkout/ - converts the caller's cart into a PENDING order
// and empties the cart. Guests get an error instead of a crash.
export async function checkoutAction(): Promise<CheckoutResult> {
  try {
    const headers = await authHeaders();
    if (!hasToken(headers)) {
      return { order: null, error: "You must be logged in to checkout." };
    }
    const res = await fetch(`${COURSES_API_URL}/api/orders/checkout/`, {
      method: "POST",
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        order: null,
        error: body.detail ?? `Checkout failed: ${res.status}`,
      };
    }
    const order: Order = await res.json();
    return { order, error: null };
  } catch (e) {
    return {
      order: null,
      error: e instanceof Error ? e.message : "Unknown error during checkout",
    };
  }
}

// Confirms a payment by firing the QAVAA webhook so the backend marks the
// order PAID and creates the course Enrollment(s).
export async function fulfillPaymentAction(
  transactionReference: string
): Promise<FulfillResult> {
  try {
    const headers = await authHeaders();
    const res = await fetch(`${COURSES_API_URL}/api/payments/webhook/QAVAA/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        transaction_reference: transactionReference,
        status: "SUCCESS",
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, error: `Payment confirmation failed: ${res.status}` };
    }
    return { ok: true, error: null };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error confirming payment",
    };
  }
}

"use server";

import { cookies } from "next/headers";

import { COURSES_API_URL } from "@/lib/student/courses-api";

export type PaymentProvider = {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  logo: string | null;
};

export type Payment = {
  id: string;
  order: string;
  provider: PaymentProvider;
  status: string;
  status_display: string;
  amount: string;
  currency: string;
  transaction_reference: string | null;
  client_secret: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentResult =
  | { payment: Payment; error: null }
  | { payment: null; error: string };

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

// POST /api/payments/initiate/ with the QAVAA provider. Returns the Payment,
// whose `client_secret` is the mock checkout URL the frontend should visit.
export async function initiatePaymentAction(
  orderId: string
): Promise<PaymentResult> {
  try {
    const headers = await authHeaders();
    if (!hasToken(headers)) {
      return { payment: null, error: "You must be logged in to pay." };
    }
    const res = await fetch(`${COURSES_API_URL}/api/payments/initiate/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ order_id: orderId, provider_code: "QAVAA" }),
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        payment: null,
        error: body.non_field_errors?.[0] ?? body.detail ?? `Payment initiation failed: ${res.status}`,
      };
    }
    const payment: Payment = await res.json();
    return { payment, error: null };
  } catch (e) {
    return {
      payment: null,
      error: e instanceof Error ? e.message : "Unknown error initiating payment",
    };
  }
}

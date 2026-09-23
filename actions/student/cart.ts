"use server";

import { cookies } from "next/headers";

import { COURSES_API_URL } from "@/lib/student/courses-api";
import type { Course } from "@/types/student/course";

export type CartItemDetail = {
  id: number;
  course: number;
  course_details: Course;
  price: string;
  added_at: string;
};

export type Cart = {
  id: string;
  user_id: string;
  items: CartItemDetail[];
  items_count: number;
  total_price: string;
  created_at: string;
  updated_at: string;
};

export type CartResult =
  | { cart: Cart | null; error: null }
  | { cart: null; error: string };

type MutationResult = { ok: boolean; error: string | null };

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

// Guests see an empty cart (null) instead of erroring, mirroring the progress
// and enrollment actions.
export async function getCartAction(): Promise<CartResult> {
  try {
    const headers = await authHeaders();
    if (!hasToken(headers)) {
      return { cart: null, error: null };
    }
    const res = await fetch(`${COURSES_API_URL}/api/carts/my-cart/`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      return { cart: null, error: `Failed to fetch cart: ${res.status}` };
    }
    const cart: Cart = await res.json();
    return { cart, error: null };
  } catch (e) {
    return { cart: null, error: e instanceof Error ? e.message : "Unknown error fetching cart" };
  }
}

export async function addToCartAction(courseId: number | string): Promise<MutationResult> {
  const headers = await authHeaders();
  if (!hasToken(headers)) {
    return { ok: false, error: "You must be logged in." };
  }
  try {
    const res = await fetch(`${COURSES_API_URL}/api/carts/add-item/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ course_id: String(courseId).trim() }),
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, error: body.detail ?? `Add to cart failed: ${res.status}` };
    }
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error adding to cart" };
  }
}

export async function removeFromCartAction(courseId: number | string): Promise<MutationResult> {
  const headers = await authHeaders();
  if (!hasToken(headers)) {
    return { ok: false, error: "You must be logged in." };
  }
  try {
    const res = await fetch(
      `${COURSES_API_URL}/api/carts/remove-item/?course_id=${encodeURIComponent(
        String(courseId).trim()
      )}`,
      { method: "DELETE", headers, cache: "no-store" }
    );
    if (!res.ok) {
      return { ok: false, error: `Remove from cart failed: ${res.status}` };
    }
    return { ok: true, error: null };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error removing from cart",
    };
  }
}

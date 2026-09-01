"use server";

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export interface CartItem {
  id: string;
  course: string;
  price: string;
  added_at: string;
  course_details: {
    id: string;
    title: string;
    price: string;
    discount_price: string;
    thumbnail: string;
  };
}

export interface CartResponse {
  id: string;
  user: number;
  items: CartItem[];
  items_count: number;
  total_price: string;
  created_at: string;
  updated_at: string;
}

export async function addToCartAction(courseId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? {
        "Authorization": `Bearer ${token}`,
        "Cookie": `access_token=${token}`
      } : {}),
    };

    const response = await fetch("http://127.0.0.1:8080/api/carts/add-item/", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ course_id: courseId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.detail || data.message || "Failed to add item to cart.",
      };
    }

    revalidatePath('/carts');
    return {
      success: true,
      cart: data,
    };
  } catch (error) {
    console.error("Error in addToCartAction:", error);
    return {
      success: false,
      error: "Network error or server unreachable.",
    };
  }
}

export async function getMyCart(): Promise<CartResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  const CART_API_URL = process.env.NEXT_PUBLIC_CART_API_URL || 'http://127.0.0.1:8080';

  try {
    const res = await fetch(`${CART_API_URL}/api/carts/my-cart/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? {
          'Authorization': `Bearer ${token}`,
          'Cookie': `access_token=${token}`
        } : {}),
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return { id: '', user: 0, items: [], items_count: 0, total_price: '0.00', created_at: '', updated_at: '' };
    }

    const data: CartResponse = await res.json();
    return data;
  } catch (error) {
    return { id: '', user: 0, items: [], items_count: 0, total_price: '0.00', created_at: '', updated_at: '' };
  }
}

export async function removeFromCartAction(courseId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? {
        "Authorization": `Bearer ${token}`,
        "Cookie": `access_token=${token}`
      } : {}),
    };

    const CART_API_URL = process.env.NEXT_PUBLIC_CART_API_URL || "http://127.0.0.1:8080";

    const response = await fetch(`${CART_API_URL}/api/carts/remove-item/`, {
      method: "DELETE",
      headers: headers,
      body: JSON.stringify({ course_id: courseId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.detail || data.message || "Échec de la suppression du cours.",
      };
    }

    revalidatePath('/carts');
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Erreur dans removeFromCartAction:", error);
    return {
      success: false,
      error: "Erreur réseau ou serveur inaccessible.",
    };
  }
}

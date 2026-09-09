'use server';

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
    slug?: string;
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

const API_URL = process.env.NEXT_PUBLIC_CART_API_URL || 'http://127.0.0.1:8080';

export async function getMyEnrolledCourses() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return [];
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Cookie': `access_token=${token}`,
  };

  try {
    const res = await fetch(`${API_URL}/api/courses/my-enrollments/`, {
      method: 'GET',
      headers: headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const rawEnrollments = Array.isArray(data) ? data : data.results || [];

    return rawEnrollments.map((enrollment: any) => {
      if (enrollment.course) {
        return {
          ...enrollment.course,
          is_enrolled: true,
          enrollment_id: enrollment.id,
        };
      }
      return {
        ...enrollment,
        is_enrolled: true,
      };
    });
  } catch (error) {
    return [];
  }
}

export async function getCoursePurchaseStatus(courseId: string) {
  try {
    const [enrolledCourses, cartData] = await Promise.all([
      getMyEnrolledCourses().catch(() => []),
      getMyCart().catch(() => null)
    ]);

    const enrollmentsList = Array.isArray(enrolledCourses)
      ? enrolledCourses
      : (enrolledCourses?.results || []);

    const matchedEnrollment = enrollmentsList.find((course: any) => {
      const currentCourseId = course.id || course.course_id || course.course?.id || course.course_details?.id;
      return String(currentCourseId).trim() === String(courseId).trim();
    });

    if (matchedEnrollment) {
      const courseSlug = matchedEnrollment.slug || matchedEnrollment.course?.slug || matchedEnrollment.course_details?.slug || null;
      return { isEnrolled: true, isAdded: false, courseSlug };
    }

    const isInCart = cartData?.items?.some((item: any) => {
      const id = item.course?.id || item.courseId || item.id || item.course_id || item.course_details?.id;
      return String(id).trim() === String(courseId).trim();
    });

    return { isEnrolled: false, isAdded: Boolean(isInCart), courseSlug: null };
  } catch (error) {
    return { isEnrolled: false, isAdded: false, courseSlug: null };
  }
}

export async function addToCartAction(courseId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return {
        success: false,
        error: "Missing access token",
      };
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Cookie: `access_token=${token}`,
    };

    const response = await fetch(`${API_URL}/api/carts/add-item/`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ course_id: courseId }),
    });

    const data = await response.json();

    if (!response.ok) {
      const status = await getCoursePurchaseStatus(courseId);

      if (status.isEnrolled) {
        return { success: false, error: "already enrolled" };
      }

      if (status.isAdded) {
        return { success: false, error: "already in cart" };
      }

      return {
        success: false,
        error: data.detail || data.message || "Failed to add item to cart.",
      };
    }

    revalidatePath('/cart');
    revalidatePath('/carts');

    return {
      success: true,
      cart: data,
    };
  } catch (error) {
    return {
      success: false,
      error: "Network error or server unreachable.",
    };
  }
}

export async function getMyCart(): Promise<CartResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? {
      'Authorization': `Bearer ${token}`,
      'Cookie': `access_token=${token}`
    } : {}),
  };

  try {
    const res = await fetch(`${API_URL}/api/carts/my-cart/`, {
      method: 'GET',
      headers: headers,
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

    const response = await fetch(`${API_URL}/api/carts/remove-item/`, {
      method: "DELETE",
      headers: headers,
      body: JSON.stringify({ course_id: courseId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.detail || data.message || "Failed to remove course from cart.",
      };
    }

    revalidatePath('/carts');
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: "Network error or server unreachable.",
    };
  }
}

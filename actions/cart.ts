"use server";

export async function addToCartAction(courseId: string, token?: string) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Injection du token Bearer si l'utilisateur est connecté
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch("http://127.0.0.1:8080/api/carts/add-item/", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ course: courseId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.detail || data.message || "Failed to add item to cart.",
      };

    }

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
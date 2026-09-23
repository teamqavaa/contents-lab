"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";

import { addToCartAction } from "@/actions/student/cart";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ courseId }: { courseId: number }) {
  const router = useRouter();
  const { itemCount, setItemCount } = useCart();
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  function add() {
    startTransition(async () => {
      const result = await addToCartAction(courseId);
      if (result.ok) {
        setAdded(true);
        setItemCount(itemCount + 1);
        router.refresh();
      }
    });
  }

  if (added) {
    return (
<Link
      href="/cart"
      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-emerald-600"
      >
        <span>View Cart</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={add}
      className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-400 px-4 py-2 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Adding...</span>
        </>
      ) : (
        <span>Add To Cart</span>
      )}
    </button>
  );
}

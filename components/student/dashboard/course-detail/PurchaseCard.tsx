"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import {
  completeCourseAction,
  startCourseAction,
  uncompleteCourseAction,
} from "@/actions/student/course-progress";
import { addToCartAction } from "@/actions/student/cart";
import { useCart } from "@/context/CartContext";
import type { ProgressStatus } from "@/actions/student/course-progress";

export default function PurchaseCard({
  courseId,
  price,
  originalPrice,
  cohortLabel,
  includedItems,
  initialStatus,
  isBought,
}: {
  courseId: number | string;
  price: string;
  originalPrice: string | null;
  cohortLabel: string;
  includedItems: string[];
  initialStatus: ProgressStatus;
  isBought: boolean;
}) {
  const router = useRouter();
  const { itemCount, setItemCount } = useCart();
  const [status, setStatus] = useState<ProgressStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  function addToCart() {
    setError(null);
    startTransition(async () => {
      const result = await addToCartAction(courseId);
      if (result.ok) {
        setAdded(true);
        setItemCount(itemCount + 1);
        router.refresh();
      } else {
        setError(result.error ?? "Could not add to cart.");
      }
    });
  }

  const current = Number(price) || 0;
  const original = originalPrice != null ? Number(originalPrice) : null;
  const discountPercent =
    original && original > current ? Math.round((1 - current / original) * 100) : null;

  function run(
    action: () => Promise<{ ok: boolean; error: string | null }>,
    next: ProgressStatus
  ) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setStatus(next);
        router.refresh();
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  function scrollToCurriculum() {
    document.getElementById("curriculum")?.scrollIntoView({ behavior: "smooth" });
  }

  const primaryButtonClass =
    "w-full rounded-full bg-blue-400 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:opacity-50";

  return (
    <div className="sticky top-8 z-10 flex w-full flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-6 font-mono shadow-xs sm:p-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-extrabold text-neutral-900">
            ${price.replace(/\.00$/, "")}
          </span>
          {original != null && (
            <span className="text-lg font-normal text-neutral-400 line-through">
              ${originalPrice?.replace(/\.00$/, "")}
            </span>
          )}
        </div>

        {(discountPercent != null || cohortLabel) && (
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            {discountPercent != null ? `${discountPercent}% off` : ""}
            {discountPercent != null && cohortLabel ? " · " : ""}
            {cohortLabel}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {!isBought ? (
          <button
            type="button"
            disabled={pending || added}
            onClick={addToCart}
            className={primaryButtonClass}
          >
            {added ? "Added to cart ✓" : "Add To Cart"}
          </button>
        ) : status === "not_started" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => startCourseAction(courseId), "in_progress")}
            className={primaryButtonClass}
          >
            Start learning
          </button>
        ) : status === "in_progress" ? (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={scrollToCurriculum}
              className={primaryButtonClass}
            >
              Continue learning
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => completeCourseAction(courseId), "completed")}
              className="w-full text-xs text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50"
            >
              Mark course complete
            </button>
          </>
        ) : (
          <>
            <span className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-5 py-2.5 text-sm font-bold text-foreground">
              <Check size={16} strokeWidth={2.5} /> Completed
            </span>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => uncompleteCourseAction(courseId), "in_progress")}
              className="w-full text-xs text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50"
            >
              Undo completion
            </button>
          </>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
        What&apos;s included
      </p>
      <div className="flex flex-col gap-2.5 pt-1 text-xs font-semibold text-neutral-800">
        {includedItems.map((item) => (
          <div key={item} className="flex items-center gap-2.5">
            <span className="font-bold text-neutral-900">✓</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

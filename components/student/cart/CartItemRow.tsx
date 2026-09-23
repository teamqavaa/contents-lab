"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { removeFromCartAction } from "@/actions/student/cart";
import { resolveThumbnail } from "@/lib/student/image";
import { useCart } from "@/context/CartContext";
import type { CartItemDetail } from "@/actions/student/cart";

export default function CartItemRow({
  item,
  hrefBase,
}: {
  item: CartItemDetail;
  hrefBase: string;
}) {
  const router = useRouter();
  const { itemCount, setItemCount } = useCart();
  const [pending, startTransition] = useTransition();

  const course = item.course_details;

  const hasDiscount =
    !!course.discount_price && parseFloat(course.discount_price) > 0;
  const displayPrice = hasDiscount
    ? parseFloat(course.discount_price!).toFixed(2)
    : parseFloat(course.price).toFixed(2);

  const remove = () => {
    startTransition(async () => {
      const result = await removeFromCartAction(course.slug);
      if (result.ok) {
        setItemCount(Math.max(0, itemCount - 1));
        router.refresh();
      }
    });
  };

  return (
    <div className="flex items-center justify-between gap-4 bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs transition-all hover:shadow-md">
      <div className="flex items-center gap-4 sm:gap-6 min-w-0">
        <Link
          href={`${hrefBase}/${course.slug}`}
          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-neutral-100 overflow-hidden shrink-0 flex items-center justify-center"
        >
          {course.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveThumbnail(course.thumbnail)}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <svg
              className="w-8 h-8 text-neutral-400 stroke-[1.5]"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          )}
        </Link>

        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-xs font-medium text-neutral-400">
            {course.category_details?.name || "General"}
          </span>
          <Link
            href={`${hrefBase}/${course.slug}`}
            className="text-base sm:text-lg font-bold text-neutral-900 line-clamp-1 transition-colors hover:text-blue-600"
          >
            {course.title}
          </Link>
          <p className="text-xs sm:text-sm text-neutral-500 line-clamp-1">
            {course.subtitle || course.description || "Learn at your own pace"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <span
          className={`text-lg font-bold ${hasDiscount ? "text-red-600" : "text-neutral-900"}`}
        >
          ${displayPrice}
        </span>

        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Remove item"
        >
          <svg className="w-5 h-5 stroke-current stroke-[2]" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CourseDetails {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  discount_price?: string;
  thumbnail: string;
  category_details?: {
    name: string;
  };
}

interface CartItemCardProps {
  item: {
    id: string;
    course: string;
    course_details: CourseDetails;
    price: string;
  };
  onRemove: (itemId: string) => Promise<void> | void;
}

export default function CartItemCard({ item, onRemove }: CartItemCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const course = item.course_details;

  const originalPrice = course?.price && !isNaN(parseFloat(course.price))
    ? parseFloat(course.price).toFixed(2)
    : '0.00';

  const discountPrice = course?.discount_price && !isNaN(parseFloat(course.discount_price))
    ? parseFloat(course.discount_price).toFixed(2)
    : null;

  // Détermine quel prix afficher : discount_price s'il existe et est supérieur à 0, sinon originalPrice
  const hasDiscount = discountPrice !== null && parseFloat(discountPrice) > 0;
  const finalDisplayPrice = hasDiscount ? discountPrice : originalPrice;

 const handleRemoveClick = async () => {
    try {
      setIsRemoving(true);
      await onRemove(item.course);

      // Notifie le header (CartButton) de rafraîchir le compteur instantanément
      window.dispatchEvent(new Event('cartUpdate'));
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setIsRemoving(false);
    }
  };
  return (
    <div className={`flex items-center justify-between bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs transition-all hover:shadow-md ${isRemoving ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-neutral-100 overflow-hidden shrink-0 flex items-center justify-center">
          {course?.thumbnail && course.thumbnail !== 'string' ? (
            <Image
              src={course.thumbnail}
              alt={course.title || 'Course'}
              fill
              className="object-cover"
            />
          ) : (
            <svg className="w-8 h-8 text-neutral-400 stroke-[1.5]" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-400">
            {course?.category_details?.name || 'General'}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 line-clamp-1">
            {course?.title || 'Course Title'}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500">
            {course?.subtitle || 'Learn at your own pace'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <span className={`text-lg font-bold ${hasDiscount ? 'text-red-600' : 'text-neutral-900'}`}>
          ${finalDisplayPrice}
        </span>

        <button
          type="button"
          onClick={handleRemoveClick}
          disabled={isRemoving}
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

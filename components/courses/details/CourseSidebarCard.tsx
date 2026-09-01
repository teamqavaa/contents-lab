import { CourseDetails } from '@/actions/courseDetail';
import { getMyCart } from '@/actions/cart';
import AddToCartButton from '../AddToCartButton';

interface CourseSidebarCardProps {
  course: CourseDetails;
}

export default async function CourseSidebarCard({ course }: CourseSidebarCardProps) {
  // 1. Récupération du panier côté serveur avec le token stocké dans les cookies
  const cart = await getMyCart();

  // 2. Vérification si le cours actuel est présent dans les items du panier
  // D'après votre interface CartItem, chaque item contient un objet "course_details" avec l'id
  const isInCart = cart?.items?.some(
    (item) => item.course_details?.id === course.id || item.course === course.id
  ) || false;

  return (
    <div className="w-full bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 font-mono flex flex-col gap-6 shadow-xs sticky top-8 z-10">
      {/* Prix & Réduction */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-extrabold text-neutral-900">${course.price}</span>
          {course.discount_price > course.price && (
            <span className="text-lg text-neutral-400 line-through font-normal">
              ${course.discount_price}
            </span>
          )}
        </div>

        {course.discount_percentage && (
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            {course.discount_percentage}% OFF &nbsp;·&nbsp; LIMITED COHORT
          </p>
        )}
      </div>

      {/* Passage direct de l'état initial au bouton */}
      <div className="w-full">
        <AddToCartButton courseId={course.id} initialInCart={isInCart} />
      </div>

      {/* Inclus dans la formation */}
      <div className="flex flex-col gap-3 pt-4 border-t border-neutral-100">
        <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
          WHAT'S INCLUDED
        </span>
        <div className="flex flex-col gap-2.5 text-xs text-neutral-800 font-semibold">
          {course.what_is_included?.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <span className="text-neutral-900 font-bold">✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

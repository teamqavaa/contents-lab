// Carte d'achat (colonne de droite) : prix, panier et contenu inclus — données de courses-api
import Link from 'next/link';
import { Award, Download, FileText, MonitorSmartphone, PlayCircle, Route, SquarePen } from 'lucide-react';

import { getMyCart } from '@/actions/cart';
import type { CourseDetails } from '@/actions/courseDetail';
import AddToCartButton from '@/components/courses/AddToCartButton';
import { courseTotals } from '@/lib/curriculum';
import { formatMinutes, plural } from '@/lib/format';

function formatPrice(value: number) {
  return value <= 0 ? 'Free' : `$${value % 1 === 0 ? value : value.toFixed(2)}`;
}

/** Prix payé et prix barré : discount_price n'est appliqué que s'il est inférieur au prix. */
export function coursePrices(course: Pick<CourseDetails, 'price' | 'discount_price'>) {
  const price = Number(course.price) || 0;
  const discount = Number(course.discount_price) || 0;
  const hasDiscount = discount > 0 && discount < price;
  return { current: hasDiscount ? discount : price, original: hasDiscount ? price : null };
}

export default async function PurchaseCard({ course }: { course: CourseDetails }) {
  const cart = course.is_enrolled ? null : await getMyCart();
  const inCart = Boolean(cart?.items?.some((item) => item.course_details?.id === course.id || item.course === course.id));
  const totals = courseTotals(course);
  const { current, original } = coursePrices(course);
  const lessons = course.modules.flatMap((module) => module.lessons || []).filter((lesson) => lesson.is_published !== false);
  const exercises = lessons.filter((lesson) => lesson.lesson_type === 'QUIZ').length;
  const articles = lessons.filter((lesson) => ['ARTICLE', 'DOCUMENT'].includes(lesson.lesson_type)).length;

  const includes = [
    totals.minutes > 0 && { icon: PlayCircle, label: `${formatMinutes(totals.minutes)} of video` },
    totals.lessons > 0 && { icon: SquarePen, label: `${plural(totals.lessons, 'lesson')} in ${plural(totals.modules, 'section')}` },
    articles > 0 && { icon: FileText, label: plural(articles, 'article') },
    course.resources.length > 0 && { icon: Download, label: `${plural(course.resources.length, 'downloadable resource')}` },
    exercises > 0 && { icon: Award, label: exercises === 1 ? '1 practice quiz' : `${exercises} practice quizzes` },
    { icon: MonitorSmartphone, label: 'Access on mobile and desktop' },
  ].filter(Boolean) as { icon: typeof PlayCircle; label: string }[];

  return (
    <aside className="flex flex-col gap-5 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm" aria-label="Purchase">
      {course.is_enrolled ? (
        <div>
          <p className="text-xl font-bold text-neutral-900">You are enrolled</p>
          <p className="mt-1 text-sm text-neutral-500">Pick up where you left off.</p>
        </div>
      ) : (
        <div>
          <p className="flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold text-neutral-900">{formatPrice(current)}</span>
            {original && <span className="text-base text-neutral-400 line-through">{formatPrice(original)}</span>}
            {original && (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-700">
                -{Math.round(((original - current) / original) * 100)}%
              </span>
            )}
          </p>
          <p className="mt-1 text-sm text-neutral-500">One-time payment, full access to the course content.</p>
        </div>
      )}

      <AddToCartButton
        courseId={course.id}
        courseSlug={course.slug}
        initialInCart={inCart}
        initialIsEnrolled={course.is_enrolled}
        size="lg"
        block
      />

      <div className="border-t border-neutral-100 pt-4">
        <p className="text-sm font-bold text-neutral-900">This course includes</p>
        <ul className="mt-3 flex flex-col gap-2.5 text-sm text-neutral-700">
          {includes.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2.5">
              <Icon className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden="true" /> {label}
            </li>
          ))}
        </ul>
      </div>

      {totals.modules > 0 && (
        <div className="rounded-lg bg-indigo-50 p-4">
          <p className="text-sm font-bold text-indigo-900">Part of a career track</p>
          <p className="mt-1 text-sm text-indigo-900/80">
            {course.title} · {plural(totals.modules, 'module')}
          </p>
          <Link
            href={`/career-tracks/${course.slug}`}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 underline underline-offset-4 hover:text-indigo-900"
          >
            <Route className="h-4 w-4" aria-hidden="true" /> View the learning path
          </Link>
        </div>
      )}
    </aside>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { getPopularCourses } from '@/actions/courses';
import { getMyCart } from '@/actions/cart';
import AddToCartButton from './AddToCartButton';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  image: string;
  duration: string;
  level: string;
  slug: string;
}

export default function MostPopularCard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [cartCourseIds, setCartCourseIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [isPaused, setIsPaused] = useState(false);

  const fetchCartData = async () => {
    try {
      const cart = await getMyCart();
      if (cart && cart.items) {
        const ids = new Set(
          cart.items.map((item: any) => item.course_details?.id || item.course || item.id)
        );
        setCartCourseIds(ids);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const data = await getPopularCourses(3);

        const mappedCourses: Course[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.subtitle || item.description || '',
          category: item.category_details?.name || 'General',
          type: 'Course',
          image: item.image || item.thumbnail || '/career.jpg',
          duration: item.duration || '20h 30m',
          level: item.level ? item.level.charAt(0).toUpperCase() + item.level.slice(1) : 'Beginner',
          slug: item.slug || item.id,
        }));

        setCourses(mappedCourses);
        await fetchCartData();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    window.addEventListener('cartUpdate', fetchCartData);
    return () => {
      window.removeEventListener('cartUpdate', fetchCartData);
    };
  }, []);

  const currentCourse = courses[currentIndex];

  const handlePrev = useCallback(() => {
    if (courses.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? courses.length - 1 : prev - 1));
  }, [courses.length]);

  const handleNext = useCallback(() => {
    if (courses.length === 0) return;
    setCurrentIndex((prev) => (prev === courses.length - 1 ? 0 : prev + 1));
  }, [courses.length]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (isPaused || courses.length === 0) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, handleNext, courses.length]);

  if (isLoading) {
    return (
      <section className="w-full bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-center items-center min-h-[300px]">
          <span className="text-neutral-500 text-sm font-medium">Loading...</span>
        </div>
      </section>
    );
  }

  if (courses.length === 0 || !currentCourse) {
    return null;
  }

  const isInCart = cartCourseIds.has(currentCourse.id);

  return (
    <section className="w-full bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">

        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0f172a] tracking-tight">
            Most popular
          </h2>
        </div>

        <div
          className="relative group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <button
            type="button"
            onClick={handlePrev}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-md flex items-center justify-center text-neutral-800 hover:bg-neutral-50 transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
            aria-label="Previous"
          >
            <svg className="w-5 h-5 stroke-current stroke-[2]" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-md flex items-center justify-center text-neutral-800 hover:bg-neutral-50 transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
            aria-label="Next"
          >
            <svg className="w-5 h-5 stroke-current stroke-[2]" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          <div className="flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden border border-neutral-200/80 shadow-sm w-full transition-all duration-300">

            <div className="relative w-full md:w-[45%] lg:w-[42%] aspect-[16/9] md:aspect-auto min-h-[260px] bg-[#0c1a30] overflow-hidden shrink-0">
              <Image
                src={currentCourse.image}
                alt={currentCourse.title}
                fill
                className="object-cover object-center transition-all duration-500"
                priority
              />

              <div className="absolute top-4 left-4 z-10">
                <span className="bg-white/90 backdrop-blur-md text-neutral-900 text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
                  {currentCourse.type}
                </span>
              </div>

              <button
                type="button"
                onClick={() => toggleFavorite(currentCourse.id)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-neutral-700 hover:bg-white hover:text-red-500 transition-colors shadow-xs cursor-pointer"
                aria-label="Add to favorites"
              >
                <svg
                  className={`w-5 h-5 ${favorites[currentCourse.id] ? 'fill-blue-500 stroke-blue-500' : 'fill-none stroke-current stroke-[2]'}`}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.575-4.688-4.575-1.742 0-3.262.908-4.312 2.29C10.95 4.583 9.43 3.675 7.688 3.675 5.099 3.675 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col justify-between p-6 sm:p-8 w-full md:w-[55%] lg:w-[58%] gap-6">

              <div className="flex flex-col gap-3">
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                  {currentCourse.title}
                </h3>

                <p className="text-sm text-neutral-500 leading-relaxed line-clamp-3">
                  {currentCourse.description}
                </p>

                <div className="pt-1">
                  <span className="inline-block bg-neutral-100 text-neutral-700 text-xs font-medium px-3 py-1.5 rounded-lg">
                    {currentCourse.category}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-100">

                <div className="flex items-center gap-3 text-xs font-medium text-neutral-500">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 stroke-current stroke-[1.8]" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{currentCourse.duration}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 stroke-current stroke-[1.8]" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a.5.5 0 00.71 0L21.75 8" />
                    </svg>
                    <span>{currentCourse.level}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Link
                    href={`/courses/${currentCourse.slug}`}
                    className="px-4 py-2 bg-white border border-neutral-200 text-neutral-800 text-xs font-bold rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    Learn More
                  </Link>

                  {/* La clé force le re-render du composant et initialInCart transmet l'état exact */}
                  <AddToCartButton
                    key={currentCourse.id}
                    courseId={currentCourse.id}
                    initialInCart={isInCart}
                  />
                </div>

              </div>

            </div>

          </div>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2">
          {courses.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                currentIndex === index
                  ? 'w-6 h-2 bg-blue-400'
                  : 'w-2 h-2 bg-neutral-300 hover:bg-neutral-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

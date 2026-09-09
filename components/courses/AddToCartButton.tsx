'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, ArrowRight, PlayCircle, X, LogIn } from 'lucide-react';
import { addToCartAction, getCoursePurchaseStatus } from '@/actions/cart';

interface AddToCartButtonProps {
  courseId: string;
  courseSlug: string;
  initialInCart?: boolean;
  initialIsEnrolled?: boolean;
  currentModuleSlug?: string;
}

const SSO_LOGIN_URL = '/api/auth/login?mode=login';

export default function AddToCartButton({
  courseId,
  courseSlug,
  initialInCart = false,
  initialIsEnrolled = false,
  currentModuleSlug
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(initialInCart);
  const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled);
  const [fetchedSlug, setFetchedSlug] = useState<string | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialInCart && !initialIsEnrolled);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    if (initialIsEnrolled || initialInCart) {
      setIsLoading(false);
      return;
    }

    getCoursePurchaseStatus(courseId)
      .then((status) => {
        if (status) {
          setIsEnrolled(status.isEnrolled);
          setIsAdded(status.isAdded);
          if (status.courseSlug) {
            setFetchedSlug(status.courseSlug);
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching course purchase status:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [courseId, initialInCart, initialIsEnrolled]);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      const result = await addToCartAction(courseId);

      const errorMessage = typeof result.error === 'string' ? result.error.toLowerCase() : '';
      const isAlreadyEnrolled = errorMessage.includes('déjà inscrit') || errorMessage.includes('already enrolled');
      const isAlreadyInCart = errorMessage.includes('déjà dans votre panier') || errorMessage.includes('already in your cart');

      if (result.success || isAlreadyInCart) {
        setIsAdded(true);
        window.dispatchEvent(new Event('cartUpdate'));
      } else if (isAlreadyEnrolled) {
        setIsEnrolled(true);
      } else {
        if (errorMessage.includes('access token manquant') || errorMessage.includes('missing access token')) {
          setShowAuthModal(true);
        } else {
          console.error('Failed to add to cart:', result.error);
        }
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const safeSlug = courseSlug || fetchedSlug || 'unknown-course';
  const basePath = `/course/${safeSlug}/learn`;
  const courseLearnLink = currentModuleSlug ? `${basePath}#${currentModuleSlug}` : basePath;

  if (!isMounted || isLoading) {
    return (
      <div className="px-4 py-2 bg-neutral-100 text-neutral-400 text-xs font-bold rounded-lg flex items-center gap-1.5 animate-pulse">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <>
      {isEnrolled ? (
        <Link
          href={courseLearnLink}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <span>View Course</span>
          <PlayCircle className="w-3.5 h-3.5" />
        </Link>
      ) : isAdded ? (
        <Link
          href="/carts"
          className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <span>View Cart</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      ) : (
        <button
          type="button"
          disabled={isAdding}
          onClick={handleAddToCart}
          className="px-4 py-2 bg-blue-400 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:cursor-not-allowed"
        >
          {isAdding ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            <span>Add To Cart</span>
          )}
        </button>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 max-w-sm w-full p-6 flex flex-col gap-4 relative">
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center gap-2 pt-2">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center mb-1">
                <LogIn className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">
                Sign in required
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                You must be signed in to your account to add courses to your cart.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <a
                href={SSO_LOGIN_URL}
                className="group flex items-center justify-between bg-blue-400 text-white pl-5 pr-1 py-1 rounded-full font-bold text-xs tracking-wider transition-all hover:bg-neutral-800 shadow-xs"
              >
                <span>SIGN IN</span>
                <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full text-black transition-transform group-hover:translate-x-0.5">
                  <svg className="w-4 h-4 stroke-current stroke-[2]" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </a>

              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2.5 px-4 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-2xl hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

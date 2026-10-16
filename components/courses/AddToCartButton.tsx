'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, ArrowRight, PlayCircle, X, LogIn, ShoppingCart } from 'lucide-react';
import { addToCartAction, getCoursePurchaseStatus } from '@/actions/cart';

interface AddToCartButtonProps {
  courseId: string;
  courseSlug: string;
  initialInCart?: boolean;
  initialIsEnrolled?: boolean;
  currentModuleSlug?: string;
  /** 'lg' + block : bouton principal pleine largeur (page détail d'un cours) */
  size?: 'sm' | 'lg';
  block?: boolean;
}

const SSO_LOGIN_URL = '/api/auth/login?mode=login';

export default function AddToCartButton({
  courseId,
  courseSlug,
  initialInCart = false,
  initialIsEnrolled = false,
  currentModuleSlug,
  size = 'sm',
  block = false,
}: AddToCartButtonProps) {
  const shape = `btn ${size === 'lg' ? 'btn-lg' : 'btn-sm'} ${block ? 'btn-block' : ''}`;
  const icon = size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';
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
      <div className={`${shape} cursor-default bg-neutral-100 text-neutral-400 animate-pulse`}>
        <Loader2 className={`${icon} animate-spin`} />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <>
      {isEnrolled ? (
        <Link
          href={courseLearnLink}
          className={`${shape} btn-primary`}
        >
          <PlayCircle className={icon} />
          <span>Go to course</span>
        </Link>
      ) : isAdded ? (
        <Link
          href="/carts"
          className={`${shape} btn-success`}
        >
          <span>View cart</span>
          <ArrowRight className={icon} />
        </Link>
      ) : (
        <button
          type="button"
          disabled={isAdding}
          onClick={handleAddToCart}
          className={`${shape} btn-primary`}
        >
          {isAdding ? (
            <>
              <Loader2 className={`${icon} animate-spin`} />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <ShoppingCart className={icon} />
              <span>Add to cart</span>
            </>
          )}
        </button>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 max-w-sm w-full p-6 flex flex-col gap-4 relative">
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="btn btn-ghost btn-icon btn-sm absolute top-3 right-3 text-neutral-400"
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
                className="btn btn-primary btn-block"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in</span>
              </a>

              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="btn btn-secondary btn-block"
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

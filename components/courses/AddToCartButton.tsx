'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { addToCartAction,  } from '@/actions/cart';
import { Loader2, ArrowRight, X, LogIn } from 'lucide-react';

interface AddToCartButtonProps {
  courseId: string;
  initialInCart?: boolean;
}

const SSO_LOGIN_URL = '/api/auth/login?mode=login';

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

export default function AddToCartButton({ courseId, initialInCart = false }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(initialInCart);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkCartStatus = async () => {
      try {
        const token = getCookie('access_token');
        if (!token) return;

        const cartData = await getCartAction(token);

        if (!isMounted) return;

        if (cartData) {
          const itemsList = Array.isArray(cartData)
            ? cartData
            : cartData.items || cartData.courses || cartData.data || [];

          const itemExists = itemsList.some((item: any) => {
            const idToCheck = item.course?.id || item.courseId || item.id || item.course_id;
            return String(idToCheck) === String(courseId);
          });

          if (itemExists) {
            setIsAdded(true);
          }
        }
      } catch (err) {
        console.error('Error checking cart status:', err);
      }
    };

    checkCartStatus();

    const handleCartUpdate = () => {
      checkCartStatus();
    };

    window.addEventListener('cartUpdate', handleCartUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('cartUpdate', handleCartUpdate);
    };
  }, [courseId]);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      const token = getCookie('access_token');

      const result = await addToCartAction(courseId, token);

      if (result.success || (result.error && typeof result.error === 'string' && (result.error.includes('déjà dans votre panier') || result.error.includes('already in your cart')))) {
        setIsAdded(true);
        window.dispatchEvent(new Event('cartUpdate'));
      } else {
        if (result.error && typeof result.error === 'string' && (result.error.includes('Access token manquant') || result.error.includes('Missing access token'))) {
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

  return (
    <>
      {isAdded ? (
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
                  <svg
                    className="w-4 h-4 stroke-current stroke-[2]"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
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

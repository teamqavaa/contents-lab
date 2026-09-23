"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { Bell, BookOpen, Briefcase, GraduationCap, LogOut, Settings, ShoppingCart, User } from "lucide-react";

import SearchTrigger from "@/components/student/search/SearchTrigger";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";
import { logoutAction } from "@/actions/student/auth";
import { cn } from "@/lib/utils";

// Mirrors the contents-lab pill top bar so the student home shares the look of
// the public landing page. The logo links home; "My Learning" is the dashboard,
// "Browse Courses" opens the catalog, and "Explore Careers" opens the full
// career-tracks listing (same page as the contents-lab /careers experience).
export default function StudentTopBar() {
  const { user } = useUser();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const [isSigningOut, startSignOut] = useTransition();

  const displayName = user?.full_name || user?.display_name || "";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed top-0 right-0 left-0 z-50 hidden bg-[#f8fafc] pt-6 pb-2 md:block">
      <div className="mx-auto w-[92%] max-w-5xl">
        <div className="flex items-center justify-between gap-8 rounded-full border border-gray-300 bg-white p-1.5 pl-2 shadow-lg shadow-gray-200/50">
          <div className="flex items-center gap-5">
            <Link
              href="/home"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black transition-transform hover:scale-105"
              aria-label="Go to home"
            >
              <span className="text-2xl font-bold text-white">QI</span>
            </Link>

            <nav className="hidden items-center gap-6 lg:gap-8 lg:flex">
              <Link
                href="/dashboard"
                aria-current={pathname.startsWith("/dashboard") ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase transition-colors",
                  pathname.startsWith("/dashboard") ? "text-blue-400" : "text-black hover:text-blue-400"
                )}
              >
                <GraduationCap size={14} strokeWidth={2} />
                My Learning
              </Link>
              <Link
                href="/browse-courses"
                aria-current={
                  pathname === "/browse-courses" || pathname.startsWith("/browse-courses/")
                    ? "page"
                    : undefined
                }
                className={cn(
                  "flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase transition-colors",
                  pathname === "/browse-courses" || pathname.startsWith("/browse-courses/")
                    ? "text-blue-400"
                    : "text-black hover:text-blue-400"
                )}
              >
                <BookOpen size={14} strokeWidth={2} />
                Browse Courses
              </Link>
              <Link
                href="/career-tracks"
                aria-current={pathname.startsWith("/career-tracks") ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase transition-colors",
                  pathname.startsWith("/career-tracks") ? "text-blue-400" : "text-black hover:text-blue-400"
                )}
              >
                <Briefcase size={14} strokeWidth={2} />
                Explore Careers
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 pr-2">
            <SearchTrigger />

            {/* Notification bell — inert until the notifications backend is wired. */}
            <button
              type="button"
              aria-label="Notifications"
              className="p-1.5 text-gray-600 transition-colors rounded-full hover:bg-gray-100 hover:text-black"
            >
              <Bell className="h-4 w-4" />
            </button>

            <Link
              href="/cart"
              aria-current={pathname === "/cart" ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-black",
                pathname === "/cart" ? "bg-gray-100 text-black" : ""
              )}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Hover flyout mirroring the public homepage profile menu: shows the
                name, a Settings link to the student settings page, and Sign Out. */}
            <div className="relative group flex items-center">
              <button
                type="button"
                className="flex items-center justify-center focus:outline-none"
                aria-label="User menu"
              >
                <div className="size-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                  {initials ? (
                    <span className="text-xs font-medium text-gray-500">
                      {initials}
                    </span>
                  ) : (
                    <User className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </button>

              <div className="absolute right-0 top-full pt-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out z-50 min-w-[180px]">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 space-y-2">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 px-1 pt-1">
                    <div className="relative flex-shrink-0">
                      <div className="size-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {initials ? (
                          <span className="text-xs font-medium text-gray-500">
                            {initials}
                          </span>
                        ) : (
                          <User className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-gray-800 truncate">
                        {displayName || "User"}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium">
                        Online
                      </span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      href="/home/settings"
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      <Settings className="h-3.5 w-3.5 text-gray-500" />
                      Settings
                    </Link>

                    <button
                      type="button"
                      onClick={() => startSignOut(() => logoutAction())}
                      disabled={isSigningOut}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5 text-red-500" />
                      {isSigningOut ? "Signing out..." : "Sign Out"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

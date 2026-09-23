"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Depth-1 student pages (children of /home plus the cart) get a left-pointing
// back arrow to /home. Deeper pages render their own breadcrumbs, so this
// component returns nothing there.
const BACK_TO_HOME_ROUTES = new Set([
  "/all-tracks",
  "/career-tracks",
  "/skill-tracks",
  "/explore-labs",
  "/browse-courses",
  "/cart",
]);

export default function StudentPageNav() {
  const pathname = usePathname();

  const showBack = BACK_TO_HOME_ROUTES.has(pathname) || pathname.startsWith("/home/");

  if (!showBack || pathname === "/home") {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6 lg:px-8">
      <Link
        href="/home"
        aria-label="Back to home"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Home
      </Link>
    </div>
  );
}

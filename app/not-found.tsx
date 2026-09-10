// app/not-found.tsx
import Link from 'next/link';
import { FileQuestion, LogIn, UserPlus, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      {/* Centered main container */}
      <div className="max-w-md space-y-6">

        {/* Main error icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
          <FileQuestion className="h-10 w-10 animate-bounce" />
        </div>

        {/* Title and description */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">404</h1>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Page Not Found
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Oops! The page you are trying to reach does not exist or has been moved.
          </p>
        </div>

        {/* Information box for login / signup */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <p className="text-xs font-medium leading-relaxed">
            💡 <strong className="font-semibold">Restricted Access:</strong> If you are trying to access a protected resource, please <span className="underline font-semibold">log in</span> or <span className="underline font-semibold">sign up</span> to continue.
          </p>
        </div>

        {/* Centered action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/api/auth/login?mode=login"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <LogIn className="h-4 w-4" />
            Log In
          </Link>

          <Link
            href="/api/auth/login?mode=register"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <UserPlus className="h-4 w-4" />
            Sign Up
          </Link>
        </div>

        {/* Discreet back to home link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <Home className="h-3.5 w-3.5" />
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}

import Link from "next/link";

export default function NotAuthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-red-50 text-red-600">
          <svg
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Not authorized
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This account does not have staff access to the admin area.
        </p>
        <Link
          href={process.env.SSO_PORTAL_URL ?? "http://localhost:3001"}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Go to student portal
        </Link>
      </div>
    </div>
  );
}
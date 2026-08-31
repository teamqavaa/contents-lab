"use client";

// Sends the user to the identity portal to sign in. The portal holds the
// session and returns staff to this app's admin via /auth/complete.
export default function LogInButton() {
  const SSO_PORTAL_URL = process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001";

  return (
    <a
      href={SSO_PORTAL_URL}
      className="text-xs font-bold tracking-wider text-black hover:text-blue-400 transition-colors uppercase"
    >
      Log In
    </a>
  );
}

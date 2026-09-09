import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function SignUpButton() {
  return (
    <Link
      href="/api/auth/login?mode=register"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
    >
      <UserPlus className="w-4 h-4 text-gray-500" />
      <span>Register</span>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Book,
  FlaskConical,
  Grid3x3,
  Home,
  Settings,
  User,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { InitialAvatar } from "./InitialAvatar";

const navItems = [
  { href: "/admin", label: "Admin", icon: Home },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: Book },
  { href: "/admin/instructors", label: "Instructors", icon: User },
  { href: "/admin/learning-paths", label: "Learning Paths", icon: BarChart3 },
  { href: "/admin/categories", label: "Categories", icon: Grid3x3 },
];

function NavIconLink({
  href,
  label,
  icon: Icon,
  isActive,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={label}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "grid size-10 place-items-center rounded-lg transition-colors",
        isActive
          ? "bg-white text-zinc-950 hover:bg-white"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
    </Link>
  );
}

export function AdminSidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const settingsActive = pathname.startsWith("/admin/settings");

  return (
    <aside
      className={cn(
        "flex h-full w-16 flex-shrink-0 flex-col items-center bg-zinc-950 py-4",
        className
      )}
    >
      <div
        className="mb-5 grid size-8 place-items-center rounded-lg bg-white/10 text-white"
        title="Qavaa Digital Readiness Lab"
      >
        <FlaskConical size={15} strokeWidth={2} />
      </div>

      <nav className="flex w-full flex-1 flex-col items-center gap-1 px-2">
        {navItems.map(({ href, label, icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/admin" && pathname.startsWith(`${href}/`));
          return (
            <NavIconLink
              key={href}
              href={href}
              label={label}
              icon={icon}
              isActive={isActive}
              onNavigate={onNavigate}
            />
          );
        })}
      </nav>

      <div className="flex w-full flex-col items-center gap-1 px-2">
        <NavIconLink
          href="/admin/settings"
          label="Settings"
          icon={Settings}
          isActive={settingsActive}
          onNavigate={onNavigate}
        />
        <InitialAvatar
          name="Amina Diallo"
          className="mt-3 size-9 text-[11px] ring-1 ring-white/20"
        />
      </div>
    </aside>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Book,
  ClipboardCheck,
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
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/labs", label: "Labs", icon: FlaskConical },
  { href: "/admin/skills", label: "Skills", icon: Grid3x3 },
  { href: "/admin/courses", label: "Courses", icon: Book },
  { href: "/admin/instructors", label: "Instructors", icon: User },
  { href: "/admin/learning-paths", label: "Learning Paths", icon: BarChart3 },
  { href: "/admin/categories", label: "Categories", icon: Grid3x3 },
  { href: "/admin/quizzes", label: "Quizzes", icon: ClipboardCheck },
];

function NavItem({
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
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-10 w-full items-center gap-3 rounded-lg px-3 transition-colors",
        isActive
          ? "bg-white text-zinc-950 hover:bg-white"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className="flex-shrink-0" />
      <span className="truncate text-sm font-medium">{label}</span>
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
        "flex h-full w-52 flex-shrink-0 flex-col bg-zinc-950 py-4",
        className
      )}
    >
      <div className="mb-1 flex items-center gap-2.5 px-3">
        <div
          className="grid size-8 flex-shrink-0 place-items-center rounded-lg bg-white/10 text-white"
          title="Qavaa Digital Readiness Lab"
        >
          <FlaskConical size={15} strokeWidth={2} />
        </div>
        <span className="truncate text-sm font-semibold text-white">
          Qavaa
        </span>
      </div>
      <p className="mb-5 px-3 text-[10px] font-medium uppercase tracking-widest text-white/40">
        Admin Portal
      </p>

      <nav className="flex w-full flex-1 flex-col gap-1 px-2">
        {navItems.map(({ href, label, icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/admin" && pathname.startsWith(`${href}/`));
          return (
            <NavItem
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

      <div className="flex w-full flex-col gap-1 px-2">
        <NavItem
          href="/admin/settings"
          label="Settings"
          icon={Settings}
          isActive={settingsActive}
          onNavigate={onNavigate}
        />
        <div className="mt-3 flex items-center gap-2.5 rounded-lg px-1 py-1">
          <InitialAvatar
            name="Amina Diallo"
            className="size-9 text-[11px] ring-1 ring-white/20"
          />
          <span className="truncate text-sm font-medium text-white/80">
            Amina Diallo
          </span>
        </div>
      </div>
    </aside>
  );
}
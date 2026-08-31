// components/header/Header.tsx
"use client";

import SearchTrigger from "@/components/search/SearchTrigger";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SignUpButton from "./SignUpButton";
import UserMenu from "./UserMenu";

export interface HeaderUser {
  name?: string;
  email?: string;
}

interface HeaderProps {
  user: HeaderUser | null;
  onSignOut: () => void;
}

export default function Header({ user, onSignOut }: HeaderProps) {
  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-[#f8fafc] pt-6 pb-2">
      <div className="w-[92%] max-w-5xl mx-auto">
        <div className="flex items-center justify-between bg-white border border-gray-300 shadow-lg shadow-gray-200/50 rounded-full p-1.5 pl-2">
          <Logo />
          <NavLinks />
          <SearchTrigger />

          <div className="flex items-center gap-2">
            {user ? <UserMenu user={user} onSignOut={onSignOut} /> : <SignUpButton />}
          </div>
        </div>
      </div>
    </header>
  );
}

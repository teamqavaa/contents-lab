// components/header/Header.tsx
"use client";

import { useEffect, useState } from "react";
import SearchTrigger from "@/components/search/SearchTrigger";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SignUpButton from "./SignUpButton";
import UserMenu from "./UserMenu";

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("app_a_token");
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    // Vérification initiale
    checkAuth();

    // Écoute de l'événement personnalisé déclenché dans la même fenêtre
    window.addEventListener("authChange", checkAuth);
    // Écoute des modifications depuis d'autres onglets
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("authChange", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-[#f8fafc] pt-6 pb-2">
      <div className="w-[92%] max-w-5xl mx-auto">
        <div className="flex items-center justify-between bg-white border border-gray-300 shadow-lg shadow-gray-200/50 rounded-full p-1.5 pl-2">
          <Logo />
          <NavLinks />
          <SearchTrigger />

          <div className="flex items-center gap-2">
            {!isLoading && (
              isAuthenticated ? <UserMenu /> : <SignUpButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

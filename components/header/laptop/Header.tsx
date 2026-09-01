// components/header/Header.tsx (App A)
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
    const checkAuth = async () => {
      try {
        // Interroge l'API qui lit le cookie HttpOnly
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(data.authenticated);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Erreur de vérification de la session :", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Vérification initiale
    checkAuth();

    // Écoute des événements de changement de session
    window.addEventListener("authChange", checkAuth);

    return () => {
      window.removeEventListener("authChange", checkAuth);
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

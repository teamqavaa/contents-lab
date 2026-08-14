// components/header/Header.tsx
import SearchTrigger from '@/components/search/SearchTrigger';
import Logo from './Logo';
import NavLinks from './NavLinks';
import SignUpButton from './SignUpButton';

export default function Header() {
  return (
    <header className="hidden md:block fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl">
      <div className="flex items-center justify-between bg-white border border-gray-300 shadow-lg shadow-gray-200/50 rounded-full p-1.5 pl-2">
        {/* Gauche : Logo */}
        <Logo />

        {/* Centre : Liens de navigation */}
        <NavLinks />
        <SearchTrigger/>

        {/* Droite : Bouton CTA */}
        <SignUpButton />
      </div>
    </header>
  );
}

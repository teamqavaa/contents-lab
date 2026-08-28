// components/header/NavLinks.tsx
import Link from 'next/link';
import LogInButton from './LogInButton';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Browse Courses', href: '/courses' },
  { label: 'Explore Careers', href: '/careers' },
];

export default function NavLinks() {
  return (
    <nav className="hidden md:flex items-center gap-6 lg:gap-8">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="text-xs font-bold tracking-wider text-black hover:text-blue-400 transition-colors uppercase"
        >
          {item.label}
        </Link>
      ))}
      <LogInButton />
    </nav>
  );
}

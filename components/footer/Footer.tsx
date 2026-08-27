// components/layout/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-white text-neutral-600 text-sm border-t border-neutral-200/60 pt-16 pb-8 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">

        {/* Section Supérieure : Logo + Colonnes de liens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* 1. Colonne de Gauche : Brand & Reseaux */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Logo Hashnode */}
            <Link href="/" className="flex items-center gap-2 text-neutral-900 font-extrabold text-2xl tracking-tight">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-400 text-white text-base">
                QI
              </span>
              <span>Ignite</span>
            </Link>

            {/* Description */}
            <p className="text-neutral-500 text-sm leading-relaxed max-w-sm">
              Qavaa Digital Readiness Lab — an 8-week hands-on coding program for people who learn by building.
            </p>

            {/* Icônes Réseaux Sociaux */}
            <div className="flex items-center gap-4 text-neutral-600 pt-2">
              {/* X (Twitter) */}
              <Link href="#" className="hover:text-neutral-900 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              {/* Discord */}
              <Link href="#" className="hover:text-neutral-900 transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
                </svg>
              </Link>
              {/* LinkedIn */}
              <Link href="#" className="hover:text-neutral-900 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
                </svg>
              </Link>
              {/* Instagram */}
              <Link href="#" className="hover:text-neutral-900 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Link>
              {/* YouTube */}
              <Link href="#" className="hover:text-neutral-900 transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </Link>
            </div>

            {/* Badge de Statut Système */}
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-neutral-200 bg-white text-xs font-medium text-neutral-700 w-fit shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All systems operational</span>
            </div>

          </div>

          {/* 2. Colonnes de Liens (Droite) */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">

            {/* Colonne Product & Explore */}
            <div className="flex flex-col gap-8">
              {/* Product */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold text-neutral-900 tracking-wide uppercase">Product</h4>
                <ul className="flex flex-col gap-2.5 text-neutral-500">
                  <li className="flex items-center gap-2">
                    <Link href="#" className="hover:text-neutral-900 transition-colors">Ignite Framework</Link>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md">New</span>
                  </li>
                  <li><Link href="#" className="hover:text-neutral-900 transition-colors">Pricing</Link></li>
                  <li><Link href="#" className="hover:text-neutral-900 transition-colors">Ignite APIs</Link></li>

                </ul>
              </div>

              {/* Explore */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold text-neutral-900 tracking-wide uppercase">Explore</h4>
                <ul className="flex flex-col gap-2.5 text-neutral-500">
                  <li><Link href="#" className="hover:text-neutral-900 transition-colors">My feed</Link></li>
                  <li><Link href="#" className="hover:text-neutral-900 transition-colors">Case studies</Link></li>
                  <li><Link href="#" className="hover:text-neutral-900 transition-colors">Referral Program</Link></li>
                </ul>
              </div>
            </div>

            {/* Colonne Company & Blogs */}
            <div className="flex flex-col gap-8">
              {/* Company */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold text-neutral-900 tracking-wide uppercase">Company</h4>
                <ul className="flex flex-col gap-2.5 text-neutral-500">
                  <li><Link href="#" className="hover:text-neutral-900 transition-colors">About Ignite</Link></li>
                  <li><Link href="#" className="hover:text-neutral-900 transition-colors">Careers</Link></li>
                  <li><Link href="#" className="hover:text-neutral-900 transition-colors">Logos and media</Link></li>
                  <li><Link href="#" className="hover:text-neutral-900 transition-colors">Changelog</Link></li>
                  <li><Link href="#" className="hover:text-neutral-900 transition-colors">Feature Requests</Link></li>
                </ul>
              </div>

              {/* Blogs */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold text-neutral-900 tracking-wide uppercase">Blogs</h4>
                <ul className="flex flex-col gap-2.5 text-neutral-500">
                  <li><Link href="#" className="hover:text-neutral-900 transition-colors">Official Blog</Link></li>
                  <li><Link href="#" className="hover:text-neutral-900 transition-colors">Engineering Blog</Link></li>
                </ul>
              </div>
            </div>

            {/* Colonne Partner, Support & Comparisons */}
            <div className="flex flex-col gap-8">
              {/* Partner with us */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold text-neutral-900 tracking-wide uppercase">Partner with us</h4>
                <ul className="flex flex-col gap-2.5 text-neutral-500">
                  <li><Link href="#" className="hover:text-neutral-900 transition-colors">Qavaa Group</Link></li>
                </ul>
              </div>

              {/* Support */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold text-neutral-900 tracking-wide uppercase">Support</h4>
                <ul className="flex flex-col gap-2.5 text-neutral-500">
                  <li><Link href="#" className="hover:text-neutral-900 transition-colors">Support docs</Link></li>
                  <li><Link href="#" className="hover:text-neutral-900 transition-colors">Contact</Link></li>
                  <li><Link href="#" className="hover:text-neutral-900 transition-colors">Join discord</Link></li>
                </ul>
              </div>

              {/* Comparisons */}
              <div>
                <Link href="#" className="inline-flex items-center gap-1 font-semibold text-neutral-900 hover:text-blue-400 transition-colors">
                  <span>Comparisons</span>
                  <svg className="w-4 h-4 stroke-current stroke-[2]" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              </div>
            </div>

          </div>

        </div>

        {/* Section Inférieure : Copyright & Legal Links */}
        <div className="pt-8 border-t border-neutral-200/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 Ignite — Qavaa Innovate.</p>

          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-neutral-900 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-neutral-900 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-neutral-900 transition-colors">Code of conduct</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

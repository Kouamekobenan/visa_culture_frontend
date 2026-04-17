'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '../../context/useContext';
import {
  LogOut,
  Ticket,
  User,
  Home,
  Calendar,
  Info,
  MessageSquare,
  LogIn,
  LucideIcon,
} from 'lucide-react';

// Configuration de la navigation centralisée
const NAV_LINKS = [
  { href: '/frontend/page/event', label: 'Événements', icon: Calendar },
  { href: '/frontend/page/about', label: 'À propos', icon: Info },
  { href: '/frontend/page/contact', label: 'Contact', icon: MessageSquare },
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Gestion du scroll pour l'effet de transparence
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermeture du menu utilisateur au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  return (
    <>
      {/* --- DESKTOP HEADER & MOBILE TOP LOGO BAR --- */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${
          isScrolled
            ? 'border-muted/20 bg-background/80 shadow-sm backdrop-blur-xl'
            : 'border-transparent bg-background/0'
        }`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          {/* LOGO */}
          <Link href="/" className="group flex items-center gap-2 select-none">
            <span className="text-xl font-black tracking-tighter text-title uppercase">
              VISA
            </span>
            <span className="text-xl font-black tracking-tighter text-foreground/70 uppercase">
              FOR CULTURE
            </span>
          </Link>
          {/* NAVIGATION DESKTOP (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-title'
                      : 'text-foreground/70 hover:text-title'
                  }`}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-title rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
          {/* ACTIONS & AUTH */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full border border-muted/20 bg-surface hover:bg-muted/5 transition-all"
                >
                  <div className="h-8 w-8 rounded-full bg-brand flex items-center justify-center text-white font-bold text-xs shadow-inner">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-bold text-foreground/80 hidden sm:block">
                    Mon Compte
                  </span>
                </button>

                {/* DROPDOWN MENU (Desktop & Mobile Profile Access) */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-muted/20 bg-background p-2 shadow-2xl animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-3 border-b border-muted/10 mb-1">
                      <p className="text-[10px] text-muted uppercase font-bold tracking-widest leading-none mb-1">
                        Session active
                      </p>
                      <p className="text-sm font-bold truncate text-foreground">
                        {user.email}
                      </p>
                    </div>
                    <MenuLink
                      href="/frontend/page/profile"
                      icon={User}
                      label="Mon Profil"
                    />
                    <MenuLink
                      href="/frontend/page/profile/history"
                      icon={Ticket}
                      label="Mes Réservations"
                    />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold text-error rounded-xl hover:bg-error/10 transition-colors mt-1 group"
                    >
                      <LogOut
                        size={18}
                        className="group-hover:-translate-x-1 transition-transform"
                      />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/frontend/page/login" className="hidden md:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold border-brand text-brand"
                >
                  Connexion
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      {/* --- MOBILE BOTTOM NAVIGATION BAR (Visible only on Mobile) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-muted/20 px-6 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Home Link */}
          <MobileTab
            href="/"
            icon={Home}
            label="Accueil"
            isActive={pathname === '/'}
          />
          {/* Dynamic Nav Links */}
          {NAV_LINKS.map((link) => (
            <MobileTab
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
              isActive={pathname === link.href}
            />
          ))}

          {/* Auth/Profile Link */}
          {user ? (
            <MobileTab
              href="/frontend/page/profile"
              icon={User}
              label="Profil"
              isActive={pathname === '/profile'}
            />
          ) : (
            <MobileTab
              href="/frontend/page/login"
              icon={LogIn}
              label="Login"
              isActive={pathname === '/frontend/page/login'}
            />
          )}
        </div>
      </nav>
    </>
  );
}

// --- SOUS-COMPOSANTS POUR LA PROPRETÉ DU CODE ---

function MobileTab({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 group">
      <div
        className={`p-2 rounded-xl transition-all ${isActive ? 'bg-title text-white shadow-lg shadow-title/30 scale-110' : 'text-muted hover:text-title'}`}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
      </div>
      <span
        className={`text-[10px] font-bold tracking-wide transition-colors ${isActive ? 'text-title' : 'text-muted'}`}
      >
        {label}
      </span>
    </Link>
  );
}
function MenuLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl hover:bg-muted/10 transition-colors group"
    >
      <Icon
        size={18}
        className="text-muted group-hover:text-brand transition-colors"
      />
      {label}
    </Link>
  );
}

'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
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
  Search,
  X,
  ArrowRight,
  Loader2,
  LayoutDashboard,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Event } from '../../module/event/domain/entities/event.entity';
import { EventRepository } from '../../module/event/infrastructure/event.repository';
import { EventService } from '../../module/event/application/event.service';
import { UserRole } from '../../utils/types/manager.type';

// Configuration de la navigation
const NAV_LINKS = [
  { href: '/frontend/page/event', label: 'Événements', icon: Calendar },
  { href: '/frontend/page/about', label: 'À propos', icon: Info },
  { href: '/frontend/page/contact', label: 'Contact', icon: MessageSquare },
];

const eventRepo = new EventRepository();
const eventService = new EventService(eventRepo);

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // États pour la recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [results, setResults] = useState<Event[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // États UI
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'ADMIN';
  const isControleur = user?.role === UserRole.CONTROLLER;

  // Logique de recherche API
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }
      setIsSearching(true);
      try {
        const response = await eventService.searchByTitle(debouncedQuery);
        setResults(response.slice(0, 5));
        setShowDropdown(response.length > 0);
      } catch (error) {
        console.error('Erreur technique recherche:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    performSearch();
  }, [debouncedQuery]);

  // Gestion du Scroll & Clic Extérieur
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      )
        setIsUserMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/frontend/page/event?search=${encodeURIComponent(searchQuery)}`,
      );
      setShowDropdown(false);
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <>
      {/* Font Import */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&display=swap');
      `}</style>

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-background/95 shadow-lg backdrop-blur-xl'
            : 'bg-background/0'
        }`}
      >
        {/* ============================================ */}
        {/* MOBILE : HEADER COMPACT (Logo + Recherche + Theme) */}
        {/* ============================================ */}
        <div className="md:hidden border-b border-muted/10">
          <div className="container mx-auto flex h-14 items-center justify-between px-3 gap-2">
            {/* Logo Mobile - Plus petit */}
            <Link
              href="/frontend/page/event"
              className="flex items-center shrink-0 transition-transform active:scale-95"
            >
              <div className="relative h-10 w-32">
                <Image
                  src="/images/logo.png"
                  fill
                  priority
                  className="object-contain object-left"
                  alt="Visa For Culture Logo"
                />
              </div>
            </Link>

            {/* Actions Mobile - Compactes */}
            <div className="flex items-center gap-1.5">
              {/* Bouton recherche */}
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className="p-2 text-foreground/70 hover:text-brand rounded-xl hover:bg-brand/5 transition-all duration-200 active:scale-95"
              >
                <Search size={20} />
              </button>

              {/* Theme toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* DESKTOP : NIVEAU 1 (Actions + Auth) */}
        {/* ============================================ */}
        <div className="hidden md:block border-b border-muted/10">
          <div className="container mx-auto flex h-14 items-center justify-between px-4">
            {/* Logo Desktop */}
            <Link
              href="/frontend/page/event"
              className="flex items-center gap-2 shrink-0 transition-transform hover:scale-105 active:scale-95 group"
            >
              <div className="relative h-12 w-48 md:h-14 md:w-56">
                <Image
                  src="/images/logo.png"
                  fill
                  priority
                  className="object-contain object-left transition-all duration-300 group-hover:brightness-110"
                  alt="Visa For Culture Logo"
                />
              </div>
            </Link>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Actions Desktop */}
            <div className="flex items-center gap-3">
              <ThemeToggle />

              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand/20 bg-brand/5 hover:bg-brand/10 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-brand/30 flex-shrink-0 shadow-lg ring-2 ring-brand/10 transition-all duration-300 group-hover:ring-brand/30">
                      <Image
                        src="/images/icon_profile.jpg"
                        width={32}
                        height={32}
                        alt="Profile"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm font-bold text-foreground/90 hidden lg:block pr-1">
                      {user.name || 'Mon Compte'}
                    </span>
                    <ChevronRight
                      size={16}
                      className={`text-brand transition-transform duration-300 ${
                        isUserMenuOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-muted/20 bg-background/95 backdrop-blur-xl p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                      {/* Header du menu */}
                      <div className="px-4 py-3 border-b border-muted/10 mb-2">
                        <p className="text-[10px] text-muted uppercase font-bold tracking-widest leading-none mb-1.5">
                          Session active
                        </p>
                        <p className="text-sm font-bold truncate text-foreground mb-0.5">
                          {user.name || 'Utilisateur'}
                        </p>
                        <p className="text-xs text-muted truncate">
                          {user.email}
                        </p>
                      </div>

                      {/* Boutons dashboard selon rôle */}
                      {isAdmin && (
                        <MenuLink
                          href="/frontend/admin/page"
                          icon={LayoutDashboard}
                          label="Dashboard Admin"
                          className="text-brand bg-brand/5 hover:bg-brand/10 mb-1"
                          badge="Admin"
                        />
                      )}

                      {isControleur && (
                        <MenuLink
                          href="/frontend/controler/page"
                          icon={LayoutDashboard}
                          label="Espace Contrôleur"
                          className="text-title bg-title/5 hover:bg-title/10 mb-1"
                          badge="Contrôle"
                        />
                      )}

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

                      <div className="border-t border-muted/10 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                        >
                          <LogOut
                            size={18}
                            className="group-hover:-translate-x-1 transition-transform duration-300"
                          />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/frontend/page/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-bold border-brand text-brand hover:bg-brand hover:text-white transition-all duration-300"
                  >
                    <LogIn size={16} className="mr-2" />
                    Connexion
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* DESKTOP : NIVEAU 2 (Nav + Recherche) */}
        {/* ============================================ */}
        <div className="hidden md:block border-b border-muted/10 bg-surface/30 backdrop-blur-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
            {/* Navigation Desktop */}
            <nav className="flex items-center gap-1 shrink-0">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`group relative flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all duration-300 rounded-xl ${
                    pathname === href
                      ? 'text-title bg-title/10'
                      : 'text-foreground/70 hover:text-title hover:bg-title/5'
                  }`}
                >
                  <Icon
                    size={16}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                  {label}
                  {pathname === href && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-title rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Zone de recherche Desktop - Élargie */}
            <div className="flex-1 max-w-2xl relative" ref={searchRef}>
              <form onSubmit={onSearchSubmit} className="relative group">
                {isSearching ? (
                  <Loader2
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-brand animate-spin"
                    size={20}
                  />
                ) : (
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-all duration-300 group-focus-within:scale-110"
                    size={20}
                  />
                )}
                <input
                  type="text"
                  placeholder="Rechercher un événement, une tombola..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() =>
                    searchQuery.length >= 2 && setShowDropdown(true)
                  }
                  className="w-full bg-background/80 border-2 border-muted/20 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-brand focus:bg-background transition-all duration-300 placeholder:text-muted/60"
                />
              </form>

              {/* Dropdown de résultats */}
              {showDropdown && (
                <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-background/95 backdrop-blur-xl border border-muted/20 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 max-h-96 overflow-y-auto">
                    {results.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between px-3 py-2 mb-2">
                          <p className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={12} />
                            Suggestions
                          </p>
                          <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-1 rounded-full">
                            {results.length} résultat
                            {results.length > 1 ? 's' : ''}
                          </span>
                        </div>

                        {results.map((event) => (
                          <Link
                            key={event.id}
                            href={`/frontend/page/details/${event.id}`}
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface transition-all duration-200 group"
                          >
                            <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 border-2 border-brand/20 shadow-md group-hover:border-brand/40 transition-all duration-300 group-hover:scale-105">
                              <Image
                                src={event.imageUrl}
                                fill
                                className="object-cover"
                                alt=""
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground truncate group-hover:text-brand transition-colors duration-200">
                                {event.title}
                              </p>
                              <p className="text-xs text-muted truncate">
                                📍 {event.location}
                              </p>
                            </div>
                            <ArrowRight
                              size={16}
                              className="text-brand opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0"
                            />
                          </Link>
                        ))}

                        <button
                          onClick={onSearchSubmit}
                          className="w-full text-center py-3 mt-2 text-xs font-bold text-brand hover:bg-brand/5 border-t border-muted/10 transition-all duration-200 rounded-b-xl"
                        >
                          Voir tous les résultats pour &quot;{searchQuery}
                        </button>
                      </>
                    ) : (
                      <div className="p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted/10 flex items-center justify-center">
                          <Search size={24} className="text-muted" />
                        </div>
                        <p className="text-sm font-semibold text-foreground mb-1">
                          Aucun événement trouvé
                        </p>
                        <p className="text-xs text-muted">
                          Essayez avec d&apos;autres mots-clés
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* MOBILE SEARCH OVERLAY */}
        {/* ============================================ */}
        {isMobileSearchOpen && (
          <div className="fixed inset-0 z-[60] bg-background animate-in slide-in-from-top duration-300 flex flex-col">
            <div className="flex items-center gap-3 w-full p-4 border-b border-muted/10 bg-surface/50">
              <Search className="text-brand shrink-0" size={20} />
              <input
                autoFocus
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-lg font-semibold outline-none placeholder:text-muted/60"
              />
              <button
                type="button"
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setSearchQuery('');
                  setResults([]);
                }}
                className="p-2 text-muted hover:text-foreground rounded-xl hover:bg-muted/10 transition-all duration-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isSearching ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="animate-spin text-brand" size={32} />
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={12} />
                    {results.length} Résultat{results.length > 1 ? 's' : ''}
                  </p>
                  {results.map((event) => (
                    <Link
                      key={event.id}
                      href={`/frontend/page/details/${event.id}`}
                      onClick={() => {
                        setIsMobileSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-4 p-4 bg-surface rounded-2xl active:scale-95 transition-all duration-200 border border-muted/10"
                    >
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden shrink-0 border-2 border-brand/20">
                        <Image
                          src={event.imageUrl}
                          fill
                          className="object-cover"
                          alt=""
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-muted truncate">
                          📍 {event.location}
                        </p>
                      </div>
                      <ArrowRight size={18} className="text-brand" />
                    </Link>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/10 flex items-center justify-center">
                    <Search size={32} className="text-muted" />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Aucun résultat
                  </p>
                  <p className="text-xs text-muted">pour &quot;{searchQuery}</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search size={48} className="text-muted mx-auto mb-4" />
                  <p className="text-sm font-semibold text-foreground">
                    Rechercher un événement
                  </p>
                  <p className="text-xs text-muted mt-1">
                    Tapez au moins 2 caractères
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ============================================ */}
      {/* MOBILE BOTTOM NAV - AVEC SAFE AREA */}
      {/* ============================================ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-muted/20 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-2">
          <MobileTab
            href="/frontend/page/event"
            icon={Home}
            label="Accueil"
            isActive={pathname === '/frontend/page/event'}
          />

          {isAdmin ? (
            <MobileTab
              href="/frontend/admin/page"
              icon={LayoutDashboard}
              label="Admin"
              isActive={pathname.includes('/admin')}
            />
          ) : isControleur ? (
            <MobileTab
              href="/frontend/controler/page"
              icon={LayoutDashboard}
              label="Contrôle"
              isActive={pathname.includes('/controler')}
            />
          ) : (
            <MobileTab
              href="/frontend/page/event"
              icon={Calendar}
              label="Événements"
              isActive={pathname === '/frontend/page/event'}
            />
          )}

          <MobileTab
            href="/frontend/page/about"
            icon={Info}
            label="À propos"
            isActive={pathname === '/frontend/page/about'}
          />

          <MobileTab
            href={user ? '/frontend/page/profile' : '/frontend/page/login'}
            icon={user ? User : LogIn}
            label={user ? 'Profil' : 'Login'}
            isActive={
              pathname.includes('profile') || pathname.includes('login')
            }
          />
        </div>
      </nav>

      {/* Spacer pour éviter que le contenu soit caché sous la bottom nav */}
      <div className="md:hidden h-20" />

      {/* Styles pour safe area iOS/Android */}
      <style jsx global>{`
        .safe-area-pb {
          padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
        }

        @supports (padding: max(0px)) {
          .safe-area-pb {
            padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </>
  );
}

// ============================================
// SOUS-COMPOSANTS
// ============================================

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
    <Link
      href={href}
      className="flex flex-col items-center gap-1 min-w-0 flex-1 px-1"
    >
      <div
        className={`p-2.5 rounded-2xl transition-all duration-300 ${
          isActive
            ? 'bg-title text-white shadow-lg shadow-title/30 scale-110'
            : 'text-muted hover:bg-muted/10 active:scale-95'
        }`}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
      </div>
      <span
        className={`text-[9px] font-bold truncate max-w-full transition-colors duration-200 ${
          isActive ? 'text-title' : 'text-muted'
        }`}
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
  className = '',
  badge,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  className?: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold rounded-xl hover:scale-[1.02] transition-all duration-200 group ${className}`}
    >
      <Icon
        size={18}
        className="shrink-0 transition-transform duration-300 group-hover:scale-110"
      />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-current/10 text-current">
          {badge}
        </span>
      )}
    </Link>
  );
}

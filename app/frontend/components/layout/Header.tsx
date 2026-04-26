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
} from 'lucide-react';
import { Event } from '../../module/event/domain/entities/event.entity';
import { EventRepository } from '../../module/event/infrastructure/event.repository';
import { EventService } from '../../module/event/application/event.service';
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
  // 1. Logique de recherche API
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

  // 2. Gestion du Scroll & Clic Extérieur
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
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${
          isScrolled
            ? 'border-muted/20 bg-background/80 shadow-sm backdrop-blur-xl'
            : 'border-transparent bg-background/0'
        }`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-2 md:gap-4">
          {' '}
          {/* LOGO */}
          {/* 1. LOGO : "shrink-0" pour qu'il ne soit jamais écrasé */}
          <Link
            href="/frontend/page/event"
            className="flex items-center gap-2 shrink-0"
          >
            <span className="text-xl font-black tracking-tighter text-title uppercase">
              VISA
            </span>
            <span className="text-xl font-black tracking-tighter text-foreground/70 uppercase hidden xl:inline">
              FOR CULTURE
            </span>
          </Link>
          {/* --- ZONE RECHERCHE DESKTOP --- */}
          <div
            className="hidden md:block flex-1 max-w-xs lg:max-w-md relative"
            ref={searchRef}
          >
            {/* ... (Contenu du formulaire inchangé) */}
            <form onSubmit={onSearchSubmit} className="relative group">
              {isSearching ? (
                <Loader2
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brand animate-spin"
                  size={18}
                />
              ) : (
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-colors"
                  size={18}
                />
              )}
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                className="w-full bg-surface/50 border border-muted/20 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand transition-all"
              />
            </form>
            {/* Dropdown de résultats */}
            {showDropdown && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-background border border-muted/20 rounded-2xl shadow-2xl z-50 overflow-hidden">
                {' '}
                <div className="p-2">
                  {results.length > 0 ? (
                    <>
                      <p className="px-3 py-2 text-[10px] font-bold text-muted uppercase tracking-widest">
                        Suggestions
                      </p>
                      {results.map((event) => (
                        <Link
                          key={event.id}
                          href={`/frontend/page/details/${event.id}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface transition-colors group"
                        >
                          <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-muted/10">
                            <Image
                              src={event.imageUrl}
                              fill
                              className="object-cover"
                              alt=""
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground truncate group-hover:text-brand transition-colors">
                              {event.title}
                            </p>
                            <p className="text-[10px] text-muted truncate">
                              {event.location}
                            </p>
                          </div>
                          <ArrowRight
                            size={14}
                            className="text-brand opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                          />
                        </Link>
                      ))}
                      <button
                        onClick={onSearchSubmit}
                        className="w-full text-center py-2.5 mt-2 text-xs font-bold text-brand hover:bg-brand/5 border-t border-muted/10"
                      >
                        Voir tous les résultats pour {searchQuery}
                      </button>
                    </>
                  ) : (
                    <p className="p-4 text-center text-sm text-muted">
                      Aucun événement trouvé
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* 3. NAVIGATION (Interdiction de rétrécir) */}
          <nav className="hidden md:flex items-center gap-1 xl:gap-2 shrink-0">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-2 lg:px-4 py-2 text-sm font-semibold transition-colors ${
                  pathname === href
                    ? 'text-title'
                    : 'text-foreground/70 hover:text-title'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          {/* ACTIONS & AUTH */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="md:hidden p-2 text-foreground/70"
            >
              <Search size={22} />
            </button>
            <ThemeToggle />

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-muted/20 bg-surface hover:bg-muted/5 transition-all"
                >
                  <div className="h-8 w-8 rounded-full bg-brand flex items-center justify-center text-white font-bold text-xs uppercase">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand/10 flex-shrink-0 shadow-lg">
                      <Image
                        src="/images/icon_profile.jpg"
                        width={40}
                        height={40}
                        alt="Logo Admin"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-foreground/80 hidden lg:block pr-2">
                    Mon Compte
                  </span>
                </button>

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

                    {/* --- BOUTON ADMIN CONDITIONNEL --- */}
                    {isAdmin && (
                      <MenuLink
                        href="/frontend/admin/page"
                        icon={LayoutDashboard}
                        label="Tableau de Bord"
                        className="text-brand bg-brand/5 mb-1"
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
              <Link href="/frontend/page/login" className="hidden sm:block">
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

        {/* --- MOBILE SEARCH OVERLAY --- */}
        {isMobileSearchOpen && (
          <div className="fixed inset-0 z-[60] bg-background animate-in slide-in-from-top duration-300 flex flex-col">
            {/* Barres de saisie */}
            <div className="flex items-center gap-3 w-full p-4 border-b border-muted/10">
              <Search className="text-brand shrink-0" size={20} />
              <input
                autoFocus
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-lg font-medium outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setSearchQuery('');
                  setResults([]);
                }}
                className="p-2 text-muted hover:text-foreground"
              >
                <X size={24} />
              </button>
            </div>

            {/* --- ZONE DES RÉSULTATS MOBILE --- */}
            <div className="flex-1 overflow-y-auto p-4">
              {isSearching ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="animate-spin text-brand" />
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
                    Résultats
                  </p>
                  {results.map((event) => (
                    <Link
                      key={event.id}
                      href={`/frontend/page/details/${event.id}`}
                      onClick={() => {
                        setIsMobileSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-4 p-3 bg-surface rounded-2xl active:scale-95 transition-all"
                    >
                      <div className="relative h-14 w-14 rounded-xl overflow-hidden shrink-0">
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
                          {event.location}
                        </p>
                      </div>
                      <ArrowRight size={16} className="text-brand" />
                    </Link>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <p className="text-center text-muted py-10 text-sm">
                  Aucun résultat pour `{searchQuery}`
                </p>
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm text-muted">
                    Tapez au moins 2 caractères pour rechercher
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* --- MOBILE BOTTOM NAV --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-muted/20 px-6 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <MobileTab
            href="/"
            icon={Home}
            label="Accueil"
            isActive={pathname === '/'}
          />

          {/* Si Admin, on peut aussi ajouter un raccourci dashboard en bas pour le mobile */}
          {isAdmin ? (
            <MobileTab
              href="/frontend/admin/page"
              icon={LayoutDashboard}
              label="Admin"
              isActive={pathname.includes('/admin')}
            />
          ) : (
            NAV_LINKS.map((link) => (
              <MobileTab
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={link.label}
                isActive={pathname === link.href}
              />
            ))
          )}
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
    </>
  );
}
// Sous-composants
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
    <Link href={href} className="flex flex-col items-center gap-1">
      <div
        className={`p-2 rounded-xl transition-all ${isActive ? 'bg-title text-white shadow-lg shadow-title/30 scale-110' : 'text-muted'}`}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
      </div>
      <span
        className={`text-[10px] font-bold ${isActive ? 'text-title' : 'text-muted'}`}
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
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl hover:bg-muted/10 transition-colors ${className}`}
    >
      <Icon size={18} className="shrink-0" />
      {label}
    </Link>
  );
}

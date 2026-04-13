"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../../context/useContext";
import { LogOut, Ticket, User } from "lucide-react";

const NAV_LINKS = [
  { href: "/events", label: "Événements" },
  { href: "/tickets", label: "Mes Tickets" },
  { href: "/about", label: "À propos" },
];

export default function Header() {
  const pathname = usePathname();
  return <HeaderInner key={pathname} pathname={pathname} />;
}

function HeaderInner({ pathname }: { pathname: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // État pour le dropdown user
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth(); // On récupère logout du contexte
  const router = useRouter();

  // Gestion du scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fermeture des menus au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    router.push("/");
  };

  return (
    <header
      ref={menuRef}
      className={[
        "sticky top-0 z-40 w-full transition-all duration-300 border-b",
        isScrolled
          ? "border-muted/30 bg-background/95 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-background/60 backdrop-blur-md",
      ].join(" ")}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* LOGO */}
        <Link href="/" className="group flex items-center gap-2 select-none">
          <span className="text-xl font-black tracking-tighter text-title uppercase">VISA</span>
          <span className="text-xl font-black tracking-tighter text-foreground/70 uppercase">FOR CULTURE</span>
        </Link>

        {/* NAVIGATION DESKTOP */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "relative px-4 py-2 text-sm font-medium transition-colors",
                  isActive ? "text-title" : "text-foreground/70 hover:text-title",
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ACTIONS & AUTH */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            /* VERSION CONNECTÉE */
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-full border border-muted/20 bg-surface hover:bg-muted/5 transition-all"
              >
                <span className="text-sm font-semibold text-foreground/80 hidden sm:block">
                  {user.name || "Mon Compte"}
                </span>
                <div className="h-8 w-8 rounded-full bg-brand flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </button>

              {/* DROPDOWN MENU */}
           {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-muted/20 bg-background p-2 shadow-2xl animate-in fade-in zoom-in duration-200">
              {/* Header du menu */}
              <div className="px-4 py-3 border-b border-muted/10 mb-1">
                <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Connecté en tant que</p>
                <p className="text-sm font-bold truncate text-foreground">{user.email}</p>
              </div>

              {/* Liens du menu */}
              <Link
                href="/profile"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-muted/10 transition-colors group"
              >
                <User size={18} className="text-muted group-hover:text-brand transition-colors" />
                Mon Profil
              </Link>

              <Link
                href="/tickets"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-muted/10 transition-colors group"
              >
                <Ticket size={18} className="text-muted group-hover:text-brand transition-colors" />
                Mes Réservations
              </Link>

              {/* Bouton de déconnexion */}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-error rounded-xl hover:bg-error/10 transition-colors mt-1 group"
              >
                <LogOut size={18} className="text-error transition-transform group-hover:translate-x-1" />
                Déconnexion
              </button>
            </div>
)}
            </div>
          ) : (
            /* VERSION NON CONNECTÉE */
            <Link href="/frontend/page/login" className="hidden md:block">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex gap-2 font-bold border-brand text-brand hover:bg-brand/5"
              >
                Connexion
              </Button>
            </Link>
          )}

          {/* Bouton hamburger mobile (inchangé mais on ajoute l'état auth dedans) */}
          <button className="md:hidden ..." onClick={() => setIsMenuOpen((v) => !v)}>
             {/* ... ton icone hamburger ... */}
          </button>
        </div>
      </div>

      {/* MENU MOBILE (Mise à jour pour l'auth) */}
      <div className={["md:hidden ...", isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"].join(" ")}>
        <nav className="flex flex-col p-4 gap-2">
           {/* ... tes liens mobiles ... */}
           <div className="pt-4 border-t border-muted/10">
             {user ? (
               <div className="flex flex-col gap-2">
                 <p className="px-3 text-sm font-bold text-title">{user.name}</p>
                 <Button onClick={handleLogout} variant="outline" className="text-error border-error/20">Déconnexion</Button>
               </div>
             ) : (
               <Link href="/login" className="w-full">
                 <Button className="w-full bg-btn font-bold">Connexion</Button>
               </Link>
             )}
           </div>
        </nav>
      </div>
    </header>
  );
}
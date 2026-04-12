"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";

const NAV_LINKS = [
  { href: "/events", label: "Événements" },
  { href: "/tickets", label: "Mes Tickets" },
  { href: "/about", label: "À propos" },
];

// ─────────────────────────────────────────────
// Wrapper : lit pathname et le passe en `key`.
// Quand la route change, React démonte/remonte HeaderInner,
// ce qui réinitialise isMenuOpen à false sans effet ni setState interdit.
// ─────────────────────────────────────────────
export default function Header() {
  const pathname = usePathname();
  return <HeaderInner key={pathname} pathname={pathname} />;
}

// ─────────────────────────────────────────────
// Inner : gère tout l'état et le rendu
// ─────────────────────────────────────────────
function HeaderInner({ pathname }: { pathname: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ✅ setState dans un callback d'event listener (autorisé)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ setState dans un callback (autorisé)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // ✅ Mutation DOM pure, pas de setState (autorisé)
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

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
        {/* ── LOGO ── */}
        <Link
          href="/"
          className="group relative flex items-center gap-2 select-none"
          aria-label="Retour à l'accueil"
        >
          <span
            className="absolute -left-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-title opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-left-2"
            aria-hidden="true"
          />
          <span className="text-xl font-black tracking-tighter text-title transition-opacity duration-200 group-hover:opacity-90">
            VISA
          </span>
          <span className="text-xl font-black tracking-tighter text-foreground/70 transition-opacity duration-200 group-hover:opacity-90">
            FOR CULTURE
          </span>
        </Link>

        {/* ── NAVIGATION DESKTOP ── */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Navigation principale"
        >
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "relative px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                  "hover:bg-muted/10 hover:text-title",
                  isActive ? "text-title" : "text-foreground/70",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
                {isActive && (
                  <span
                    className="absolute bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-title"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── ACTIONS ── */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex gap-2 font-medium"
          >
            Connexion
          </Button>

          {/* Bouton hamburger animé */}
          <button
            className={[
              "md:hidden relative flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200",
              "border-muted/20 bg-surface hover:bg-muted/10",
              isMenuOpen ? "bg-muted/10" : "",
            ].join(" ")}
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="sr-only">{isMenuOpen ? "Fermer" : "Menu"}</span>
            <span className="flex flex-col gap-[5px]" aria-hidden="true">
              <span
                className={[
                  "block h-[1.5px] w-5 rounded-full bg-foreground origin-center transition-all duration-300",
                  isMenuOpen ? "translate-y-[6.5px] rotate-45" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "block h-[1.5px] w-5 rounded-full bg-foreground transition-all duration-200",
                  isMenuOpen ? "opacity-0 scale-x-0" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "block h-[1.5px] w-5 rounded-full bg-foreground origin-center transition-all duration-300",
                  isMenuOpen ? "-translate-y-[6.5px] -rotate-45" : "",
                ].join(" ")}
              />
            </span>
          </button>
        </div>
      </div>
      {/* ── MENU MOBILE ── */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
        className={[
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <nav
          className="flex flex-col border-t border-muted/20 bg-background/98 backdrop-blur-xl px-4 pt-3 pb-6 gap-1"
          aria-label="Navigation mobile"
        >
          {NAV_LINKS.map(({ href, label }, i) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors duration-150",
                  "hover:bg-muted/10 hover:text-title",
                  isActive ? "bg-muted/10 text-title" : "text-foreground/80",
                ].join(" ")}
                style={{ transitionDelay: isMenuOpen ? `${i * 40}ms` : "0ms" }}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-title flex-shrink-0"
                    aria-hidden="true"
                  />
                )}
                {label}
              </Link>
            );
          })}
          <div className="mt-3 flex flex-col gap-3 border-t border-muted/10 pt-4">
            <div className="flex items-center justify-between px-3">
              <span className="text-sm font-medium text-foreground/60">
                Thème
              </span>
              <ThemeToggle />
            </div>
            <Button className="mx-3 w-auto font-medium">Connexion</Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

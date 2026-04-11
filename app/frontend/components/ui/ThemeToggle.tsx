"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

// ── Store externe : localStorage + prefers-color-scheme ────────────────────

function subscribeToTheme(callback: () => void): () => void {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  // "themechange" : event custom dispatché par toggleTheme
  // "change"      : changement de préférence système
  mediaQuery.addEventListener("change", callback);
  window.addEventListener("themechange", callback);
  return () => {
    mediaQuery.removeEventListener("change", callback);
    window.removeEventListener("themechange", callback);
  };
}

function getThemeSnapshot(): boolean {
  const saved = localStorage.getItem("theme");
  if (saved) return saved === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// SSR : false → pas de mismatch hydratation, pas de flash
function getServerSnapshot(): boolean {
  return false;
}

// ──────────────────────────────────────────────────────────────────────────

export default function ThemeToggle() {
  // ✅ useSyncExternalStore :
  //   - SSR            → getServerSnapshot() = false  (pas de flash, pas de mismatch)
  //   - client initial → getThemeSnapshot()           (valeur réelle depuis localStorage)
  //   - sur changement → re-render automatique        (via subscribeToTheme)
  // Zéro useState, zéro useEffect pour l'initialisation, zéro setState interdit.
  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerSnapshot,
  );

  // ✅ Mutation DOM pure (pas de setState) — autorisé par le React Compiler
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = () => {
    const next = !isDark;
    localStorage.setItem("theme", next ? "dark" : "light");
    // Notifie subscribeToTheme → useSyncExternalStore relit getThemeSnapshot → re-render
    window.dispatchEvent(new Event("themechange"));
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      className="p-2 rounded-lg bg-surface hover:bg-muted/20 border border-muted/20 transition-all duration-200 group"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-title group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon className="h-5 w-5 text-foreground group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}

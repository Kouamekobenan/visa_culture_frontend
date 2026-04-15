'use client';

import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="relative bg-surface border-t border-muted/10 pt-16 pb-24 md:pb-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* COLONNE 1 : BRAND & DESCRIPTION */}
          <div className="space-y-6">
            <Link href="/" className="flex flex-col select-none">
              <span className="text-2xl font-black tracking-tighter text-title uppercase font-title">
                VISA
              </span>
              <span className="text-xl font-black tracking-tighter text-foreground/70 uppercase font-title leading-none">
                FOR CULTURE
              </span>
            </Link>
            <p className="text-muted text-sm leading-relaxed max-w-xs">
              Votre passerelle numérique vers les événements culturels les plus
              prestigieux. Réservez, participez et gagnez des lots
              exceptionnels.
            </p>
            <div className="flex items-center gap-4">
              <SocialIcon href="#" label="Facebook">
                {/* Facebook SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="Instagram">
                {/* Instagram SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="X (Twitter)">
                {/* X / Twitter SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l16 16M4 20L20 4"/>
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* COLONNE 2 : NAVIGATION RAPIDE */}
          <div className="space-y-6">
            <h4 className="text-foreground font-bold text-lg uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-3">
              <FooterLink href="/frontend/page/event">Événements</FooterLink>
              <FooterLink href="/frontend/page/about">Qui sommes-nous ?</FooterLink>
              <FooterLink href="/tickets">Mes Réservations</FooterLink>
              <FooterLink href="/faq">Aide & FAQ</FooterLink>
            </ul>
          </div>

          {/* COLONNE 3 : CONTACT & SUPPORT */}
          <div className="space-y-6">
            <h4 className="text-foreground font-bold text-lg uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-muted text-sm">
                <MapPin size={18} className="text-brand shrink-0" />
                <span>
                  Abidjan, Côte d&apos;Ivoire
                  <br />
                  Plateau, Avenue Marchand
                </span>
              </li>
              <li className="flex items-center gap-3 text-muted text-sm hover:text-brand transition-colors">
                <Phone size={18} className="text-brand shrink-0" />
                <a href="tel:+22500000000">+225 01 02 03 04 05</a>
              </li>
              <li className="flex items-center gap-3 text-muted text-sm hover:text-brand transition-colors">
                <Mail size={18} className="text-brand shrink-0" />
                <a href="mailto:contact@visafortculture.com">
                  contact@visafortculture.com
                </a>
              </li>
            </ul>
          </div>

          {/* COLONNE 4 : NEWSLETTER */}
          <div className="space-y-6">
            <h4 className="text-foreground font-bold text-lg uppercase tracking-wider">
              Newsletter
            </h4>
            <p className="text-muted text-sm">
              Recevez les alertes pour les nouveaux événements.
            </p>
            <form className="relative group" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Votre email"
                className="w-full bg-background border border-muted/20 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-btn text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Send size={16} />
              </button>
            </form>
            <div className="flex items-center gap-2 text-[10px] text-muted font-medium uppercase tracking-widest">
              <ShieldCheck size={14} className="text-btn" />
              Paiements sécurisés par Wave
            </div>
          </div>
        </div>

        {/* BARRE DE COPYRIGHT */}
        <div className="pt-8 border-t border-muted/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted text-xs">
            © {currentYear}{' '}
            <span className="font-bold text-foreground">Visa For Culture</span>.
            Tous droits réservés.
          </p>
          <div className="flex gap-6 text-xs text-muted">
            <Link href="/terms" className="hover:text-title transition-colors">
              Mentions Légales
            </Link>
            <Link href="/privacy" className="hover:text-title transition-colors">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* --- SOUS-COMPOSANTS --- */

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group text-muted text-sm hover:text-title hover:translate-x-1 flex items-center transition-all duration-300"
      >
        <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
          ›
        </span>
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="p-2 rounded-lg bg-background border border-muted/10 text-muted hover:text-brand hover:border-brand transition-all duration-300"
    >
      {children}
    </a>
  );
}
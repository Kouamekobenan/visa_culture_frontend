'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Send, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-surface border-t border-muted/10 pt-12 pb-20 md:pt-16 md:pb-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
          {/* BRAND SECTION */}
          <div className="lg:col-span-4 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
            <Link href="/" className="flex flex-col select-none group">
              <span className="text-2xl font-black tracking-tighter text-title uppercase font-title group-hover:text-brand transition-colors">
                VISA
              </span>
              <span className="text-xl font-black tracking-tighter text-foreground/70 uppercase font-title leading-none">
                FOR CULTURE
              </span>
            </Link>
            <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto lg:mx-0">
              Votre passerelle numérique vers les événements culturels les plus
              prestigieux. Réservez, participez et gagnez.
            </p>

            {/* SOCIAL ICONS AVEC SVG DIRECTS */}
            <div className="flex items-center gap-3">
              <SocialIcon href="#" label="Facebook">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.925 5.483-5.925 1.74 0 3.206.13 3.641.186v4.225H15.75c-1.981 0-2.364.941-2.364 2.324v1.77h4.682l-.61 3.667h-4.072v7.99H9.101z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="Instagram">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="X (Twitter)">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                >
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* LINKS SECTION */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-5">
              <h4 className="text-foreground font-bold text-xs md:text-sm uppercase tracking-[0.2em]">
                Navigation
              </h4>
              <ul className="space-y-3">
                <FooterLink href="/event">Événements</FooterLink>
                <FooterLink href="/about">À propos</FooterLink>
                <FooterLink href="/tickets">Billetterie</FooterLink>
                <FooterLink href="/faq">Support</FooterLink>
              </ul>
            </div>
            <div className="space-y-5">
              <h4 className="text-foreground font-bold text-xs md:text-sm uppercase tracking-[0.2em]">
                Contact
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-muted text-sm group">
                  <Phone size={14} className="text-brand shrink-0" />
                  <a
                    href="tel:+22500000000"
                    className="group-hover:text-brand transition-colors"
                  >
                    +225 01020304
                  </a>
                </li>
                <li className="flex items-center gap-2 text-muted text-sm group">
                  <Mail size={14} className="text-brand shrink-0" />
                  <a
                    href="mailto:contact@visa.com"
                    className="group-hover:text-brand transition-colors"
                  >
                    contact@visa.com
                  </a>
                </li>
                <li className="flex items-start gap-2 text-muted text-sm">
                  <MapPin size={14} className="text-brand shrink-0 mt-0.5" />
                  <span>Plateau, Abidjan</span>
                </li>
              </ul>
            </div>
          </div>

          {/* NEWSLETTER SECTION */}
          <div className="lg:col-span-4 space-y-6 bg-muted/5 p-6 rounded-2xl lg:bg-transparent lg:p-0">
            <div className="space-y-2 text-center lg:text-left">
              <h4 className="text-foreground font-bold text-xs md:text-sm uppercase tracking-[0.2em]">
                Newsletter
              </h4>
              <p className="text-muted text-sm">
                Restez informé des prochains tirages.
              </p>
            </div>
            <form
              className="relative group max-w-sm mx-auto lg:mx-0"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="votre@email.com"
                className="w-full bg-background border border-muted/20 rounded-full py-3.5 px-6 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2.5 bg-brand text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                <Send size={16} />
              </button>
            </form>
            <div className="flex items-center justify-center lg:justify-start gap-2 text-[10px] text-muted font-bold uppercase tracking-widest opacity-80">
              <ShieldCheck size={14} className="text-green-500" />
              Paiements sécurisés par Wave
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-muted/10 flex flex-col-reverse md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-muted text-[11px] md:text-xs tracking-wide">
            © {currentYear}{' '}
            <span className="font-bold text-foreground underline decoration-brand/30 underline-offset-4">
              Visa For Culture
            </span>
            .
          </p>
          <div className="flex gap-8 text-[11px] md:text-xs font-semibold uppercase tracking-tighter">
            <Link
              href="/terms"
              className="text-muted hover:text-brand transition-colors"
            >
              Conditions
            </Link>
            <Link
              href="/privacy"
              className="text-muted hover:text-brand transition-colors"
            >
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

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
        className="text-muted text-sm hover:text-brand flex items-center transition-all duration-200 py-1"
      >
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
      className="w-10 h-10 flex items-center justify-center rounded-full bg-muted/5 border border-muted/10 text-muted hover:bg-brand hover:text-white hover:-translate-y-1 transition-all duration-300"
    >
      {children}
    </a>
  );
}

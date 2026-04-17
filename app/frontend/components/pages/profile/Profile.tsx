'use client';

import { useAuth } from '@/app/frontend/context/useContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Ticket,
  Trophy,
  Star,
  Settings,
  LogOut,
  Bell,
  Shield,
  ChevronRight,
  User,
  Sparkles,
  Gift,
  Clock,
  CreditCard,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { formatDate, formatFullDateTime } from '@/app/frontend/utils/types/conversion.data';

/* --- Types & Data inchangés --- */
type NavItem = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  accent: string;
  accentText: string;
  badge?: string;
};

type QuickStat = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  {
    id: 'tickets',
    label: 'Mes Tickets',
    description: 'Historique de vos billets achetés',
    icon: <Ticket size={18} />,
    href: '/frontend/page/profile/history',
    accent: 'bg-brand/10',
    accentText: 'text-brand',
    badge: 'Nouveau',
  },
  {
    id: 'lottery',
    label: 'Loterie',
    description: 'Participez aux tirages en cours',
    icon: <Sparkles size={18} />,
    href: '/lottery',
    accent: 'bg-title/10',
    accentText: 'text-title',
  },
  {
    id: 'results',
    label: 'Résultats Tombola',
    description: 'Consultez les gagnants des tirages',
    icon: <Trophy size={18} />,
    href: '/lottery/results',
    accent: 'bg-yellow-400/10',
    accentText: 'text-yellow-500',
  },
  {
    id: 'rewards',
    label: 'Mes Récompenses',
    description: 'Vos gains et cadeaux remportés',
    icon: <Gift size={18} />,
    href: '/rewards',
    accent: 'bg-pink-500/10',
    accentText: 'text-pink-500',
  },
  {
    id: 'history',
    label: 'Historique Paiements',
    description: 'Toutes vos transactions',
    icon: <CreditCard size={18} />,
    href: '/payments/history',
    accent: 'bg-emerald-500/10',
    accentText: 'text-emerald-500',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Gérer vos alertes et rappels',
    icon: <Bell size={18} />,
    href: '/notifications',
    accent: 'bg-blue-500/10',
    accentText: 'text-blue-500',
  },
  {
    id: 'security',
    label: 'Sécurité',
    description: 'Mot de passe et authentification',
    icon: <Shield size={18} />,
    href: '/security',
    accent: 'bg-violet-500/10',
    accentText: 'text-violet-500',
  },
  {
    id: 'settings',
    label: 'Paramètres',
    description: 'Préférences de votre compte',
    icon: <Settings size={18} />,
    href: '/settings',
    accent: 'bg-muted/10',
    accentText: 'text-muted',
  },
];

/* --- Sub-components --- */

const Avatar = ({ name }: { name: string }) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
      <svg
        className="absolute inset-0 w-full h-full animate-spin-slow"
        viewBox="0 0 80 80"
      >
        <circle
          cx="40"
          cy="40"
          r="37"
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="2.5"
          strokeDasharray="60 180"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-[5px] rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center">
        <span className="font-title font-bold text-lg md:text-xl text-brand tracking-tight">
          {initials}
        </span>
      </div>
    </div>
  );
};

const RoleBadge = ({ role }: { role: string }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-title/10 border border-title/20 text-title text-[10px] font-bold uppercase tracking-widest">
    <Star size={9} />
    {role}
  </span>
);

const StatCard = ({ label, value, icon }: QuickStat) => (
  <div className="flex-1 bg-surface rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3 flex flex-col gap-1.5 transition-transform hover:scale-[1.02]">
    <div className="text-muted">{icon}</div>
    <p className="font-title font-bold text-base text-foreground leading-none">
      {value}
    </p>
    <p className="text-[10px] text-muted">{label}</p>
  </div>
);

const NavRow = ({ item, onClick }: { item: NavItem; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="group w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-surface hover:bg-brand/5 border border-gray-100 dark:border-gray-800 hover:border-brand/30 transition-all duration-200 text-left"
  >
    <div
      className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center ${item.accent} ${item.accentText} transition-transform duration-200 group-hover:scale-110`}
    >
      {item.icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-title text-sm font-bold text-foreground">
          {item.label}
        </p>
        {item.badge && (
          <span className="px-1.5 py-0.5 rounded-md bg-btn/15 text-btn text-[9px] font-bold uppercase tracking-wide">
            {item.badge}
          </span>
        )}
      </div>
      <p className="text-[11px] text-muted truncate mt-0.5">
        {item.description}
      </p>
    </div>
    <ChevronRight
      size={15}
      className="text-muted flex-shrink-0 group-hover:text-brand group-hover:translate-x-0.5 transition-all duration-200"
    />
  </button>
);

/* --- Main Component --- */
export default function ProfileUser() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;
  const date = formatDate(user?.createdAt ?? new Date());
  const stats: QuickStat[] = [
    { label: 'Tickets achetés', value: '12', icon: <Ticket size={14} /> },
    { label: 'Tombolas jouées', value: '5', icon: <Trophy size={14} /> },
    { label: 'Membre depuis', value: date, icon: <Clock size={14} /> },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      logout?.();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Container Principal en Grid sur Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* --- COLONNE GAUCHE (Profil & Stats) --- */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-8">
          {/* HERO CARD */}
          <div className="relative overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 bg-surface p-6 md:p-8 shadow-sm">
            <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand/5 blur-2xl" />

            <div className="relative flex flex-col items-center text-center gap-4">
              <Avatar name={user.name} />

              <div className="space-y-1">
                <RoleBadge role={user.role} />
                <h1 className="font-title text-2xl font-bold text-foreground mt-2">
                  {user.name}
                </h1>
                <p className="text-sm text-muted">{user.email}</p>
                {user.phone && (
                  <p className="text-xs text-muted/70">{user.phone}</p>
                )}
              </div>

              <button
                onClick={() => router.push('/profile/edit')}
                className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-brand/10 text-brand hover:bg-brand/20 transition-colors text-sm font-bold"
              >
                <User size={16} />
                Modifier le profil
              </button>
            </div>

            {/* Stats en ligne */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-3">
              {stats.map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
            </div>
          </div>

          {/* DÉCONNEXION (Visible sous le profil sur desktop) */}
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 font-title text-sm font-bold hover:bg-red-100 dark:hover:bg-red-950/40 transition-all disabled:opacity-50"
          >
            <LogOut size={16} />
            {loggingOut ? 'Déconnexion...' : 'Se déconnecter'}
          </Button>

          <p className="text-center text-[10px] text-muted/50">
            Compte créé en{' '}
            {new Date(user.createdAt ?? Date.now()).getFullYear()}
          </p>
        </div>
        {/* --- COLONNE DROITE (Navigation / Menu) --- */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="bg-surface/50 rounded-3xl p-2 md:p-6 border border-gray-100 dark:border-gray-800">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest pl-4 mb-4">
              Mon espace personnel
            </p>

            {/* Grille de navigation : 1 col mobile, 2 cols desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {NAV_ITEMS.map((item) => (
                <NavRow
                  key={item.id}
                  item={item}
                  onClick={() => router.push(item.href)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

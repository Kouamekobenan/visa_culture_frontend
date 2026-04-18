import {
  Bell,
  CreditCard,
  Gift,
  Settings,
  Shield,
  Sparkles,
  Ticket,
  Trophy,
} from 'lucide-react';

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

export const NAV_ITEMS: NavItem[] = [
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
    href: '/frontend/page/lottery',
    accent: 'bg-title/10',
    accentText: 'text-title',
  },
  {
    id: 'results',
    label: 'Résultats Tombola',
    description: 'Consultez les gagnants des tirages',
    icon: <Trophy size={18} />,
    href: '/frontend/page/draws',
    accent: 'bg-yellow-400/10',
    accentText: 'text-yellow-500',
  },
  {
    id: 'rewards',
    label: 'Mes Récompenses',
    description: 'Vos gains et cadeaux remportés',
    icon: <Gift size={18} />,
    href: '/frontend/page/rewards',
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
  // {
  //   id: 'security',
  //   label: 'Sécurité',
  //   description: 'Mot de passe et authentification',
  //   icon: <Shield size={18} />,
  //   href: '/frontend/page/profile/edit',
  //   accent: 'bg-violet-500/10',
  //   accentText: 'text-violet-500',
  // },
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

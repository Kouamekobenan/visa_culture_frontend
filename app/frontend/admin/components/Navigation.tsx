// app/frontend/components/layout/AdminSidebar.tsx
'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/useContext';

// ─── Theme store ──────────────────────────────────────────────────────────────
function subscribeToTheme(cb: () => void) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', cb);
  window.addEventListener('themechange', cb);
  return () => {
    mq.removeEventListener('change', cb);
    window.removeEventListener('themechange', cb);
  };
}
const getThemeSnapshot = () => {
  const saved = localStorage.getItem('theme');
  if (saved) return saved === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};
const getServerSnapshot = () => false;

// ─── Icons ────────────────────────────────────────────────────────────────────
const icons = {
  dashboard: (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  events: (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  users: (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  ),
  tickets: (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d="M2 9a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v2a2 2 0 0 0 0 4v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a2 2 0 0 0 0-4V9z" />
      <line x1="9" y1="8" x2="9" y2="16" strokeDasharray="2 2" />
    </svg>
  ),
  lottery: (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12l2 2 4-4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    </svg>
  ),
  analytics: (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d="M3 3v18h18" />
      <path d="M7 16l4-6 4 4 4-7" />
    </svg>
  ),
  settings: (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  chevron: (
    <svg
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  ),
  logout: (
    <svg
      width="15"
      height="15"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

// ─── Nav groups ───────────────────────────────────────────────────────────────
const navGroups = [
  {
    label: 'Principal',
    items: [
      {
        href: '/frontend/admin/page',
        label: 'Dashboard',
        icon: icons.dashboard,
      },
      {
        href: '/frontend/admin/page/events',
        label: 'Événements',
        icon: icons.events,
      },
      {
        href: '/frontend/admin/page/users',
        label: 'Utilisateurs',
        icon: icons.users,
      },
    ],
  },
  {
    label: 'Gestion',
    items: [
      {
        href: '/frontend/admin/page/controller',
        label: 'Controleurs',
        icon: icons.tickets,
      },
      {
        href: '/frontend/admin/page/lottery',
        label: 'Tombola',
        icon: icons.lottery,
      },
    ],
  },
  {
    label: 'Système',
    items: [
      {
        href: '/frontend/admin/page/analytics',
        label: 'Analytics',
        icon: icons.analytics,
      },
      {
        href: '/frontend/admin/page/settings',
        label: 'Paramètres',
        icon: icons.settings,
      },
    ],
  },
];

// ─── NavLink ──────────────────────────────────────────────────────────────────
function NavLink({
  href,
  label,
  icon,
  isActive,
  collapsed,
  isDark,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  collapsed: boolean;
  isDark: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
        transition-all duration-150 font-['Inter',sans-serif]
        ${
          isActive
            ? isDark
              ? 'bg-[#0d9488]/15 text-[#f9fafb]'
              : 'bg-[#0d9488]/10 text-[#111827]'
            : isDark
              ? 'text-[#9ca3af] hover:bg-white/[0.04] hover:text-[#f9fafb]'
              : 'text-[#6b7280] hover:bg-[#0d9488]/[0.06] hover:text-[#111827]'
        }
      `}
    >
      {/* Barre active */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#0d9488]" />
      )}

      {/* Icon */}
      <span
        className={`flex-shrink-0 transition-colors duration-150 ${isActive ? 'text-[#0d9488]' : ''}`}
      >
        {icon}
      </span>

      {/* Label */}
      <span
        className={`
        text-[13px] font-medium whitespace-nowrap
        transition-[opacity,transform] duration-200
        ${collapsed ? 'opacity-0 -translate-x-2 pointer-events-none w-0' : 'opacity-100 translate-x-0'}
      `}
      >
        {label}
      </span>

      {/* Tooltip collapsed */}
      {collapsed && (
        <div
          className={`
          absolute left-full ml-3 px-2.5 py-1.5 rounded-lg
          text-[11px] whitespace-nowrap font-['Inter',sans-serif]
          opacity-0 group-hover:opacity-100
          pointer-events-none transition-opacity duration-150
          shadow-lg z-50
          ${
            isDark
              ? 'bg-[#1f2937] border border-white/[0.12] text-[#f9fafb]'
              : 'bg-white border border-black/[0.08] text-[#111827]'
          }
        `}
        >
          {label}
        </div>
      )}
    </Link>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerSnapshot,
  );

  const handleLogout = (): void => {
    setIsLoggingOut(true);
    logout();
    router.push('/frontend/page/login');
  };

  // Initiales avatar
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AD';

  return (
    <aside
      className={`
      relative flex flex-col h-screen
      border-r transition-[width] duration-300 ease-[cubic-bezier(.16,1,.3,1)]
      font-['Inter',sans-serif]
      ${
        isDark
          ? 'bg-[#030712] border-white/[0.07]'
          : 'bg-white border-black/[0.07] shadow-sm'
      }
      ${collapsed ? 'w-[68px]' : 'w-[220px]'}
    `}
    >
      {/* ── Logo ── */}

      <Link href="/frontend/page/event">
        <div
          className={`
        flex items-center gap-3 px-5 py-5
        border-b overflow-hidden
        ${isDark ? 'border-white/[0.07]' : 'border-black/[0.07]'}
      `}
        >
          <div
            className={`
          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
          border
          ${
            isDark
              ? 'bg-[#0d9488]/20 border-[#0d9488]/30'
              : 'bg-[#0d9488]/10 border-[#0d9488]/20'
          }
        `}
          >
            <div className="w-3 h-3 rounded-sm bg-[#0d9488]" />
          </div>

          <span
            className={`
          font-['Space_Grotesk',sans-serif] text-[15px] font-bold tracking-tight
          whitespace-nowrap transition-[opacity,transform] duration-200
          ${isDark ? 'text-[#f9fafb]' : 'text-[#111827]'}
          ${collapsed ? 'opacity-0 -translate-x-2 pointer-events-none' : 'opacity-100 translate-x-0'}
        `}
          >
            Admin<span className="text-[#f97316]">.</span>
          </span>
        </div>
      </Link>

      {/* ── Nav ── */}
      <nav className="flex flex-col gap-4 px-3 py-4 flex-1 overflow-y-auto overflow-x-hidden">
        {navGroups.map((group) => (
          <div key={group.label}>
            {/* Label groupe */}
            <p
              className={`
              text-[10px] uppercase tracking-[0.1em] font-semibold
              px-2 mb-1.5 whitespace-nowrap
              transition-[opacity] duration-200
              ${isDark ? 'text-[#6b7280]' : 'text-[#9ca3af]'}
              ${collapsed ? 'opacity-0' : 'opacity-100'}
            `}
            >
              {group.label}
            </p>

            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/frontend/admin/page' &&
                    pathname.startsWith(item.href));

                return (
                  <NavLink
                    key={item.href}
                    {...item}
                    isActive={isActive}
                    collapsed={collapsed}
                    isDark={isDark}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div
        className={`
        border-t px-3 py-4 overflow-hidden
        ${isDark ? 'border-white/[0.07]' : 'border-black/[0.07]'}
      `}
      >
        {/* User info */}
        <div
          className={`
          flex items-center gap-2.5 px-2 mb-3
          ${collapsed ? 'justify-center' : ''}
        `}
        >
          <div
            className={`
            w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
            border font-bold text-[10px]
            ${
              isDark
                ? 'bg-[#0d9488]/20 border-[#0d9488]/40 text-[#0d9488]'
                : 'bg-[#0d9488]/10 border-[#0d9488]/30 text-[#0d9488]'
            }
          `}
          >
            {initials}
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p
                className={`text-[12px] font-semibold truncate ${isDark ? 'text-[#f9fafb]' : 'text-[#111827]'}`}
              >
                {user?.name ?? 'Administrateur'}
              </p>
              <p
                className={`text-[10px] truncate ${isDark ? 'text-[#6b7280]' : 'text-[#9ca3af]'}`}
              >
                {user?.email ?? 'admin@site.ci'}
              </p>
            </div>
          )}
        </div>

        {/* Bouton logout */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-xl
            transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            ${collapsed ? 'justify-center' : ''}
            ${
              isDark
                ? 'text-[#6b7280] hover:text-[#f97316] hover:bg-[#f97316]/[0.08]'
                : 'text-[#9ca3af] hover:text-[#f97316] hover:bg-[#f97316]/[0.06]'
            }
          `}
        >
          <span
            className={`flex-shrink-0 ${isLoggingOut ? 'animate-spin' : ''}`}
          >
            {isLoggingOut ? (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              icons.logout
            )}
          </span>
          {!collapsed && (
            <span className="text-[12px] font-medium">
              {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
            </span>
          )}
        </button>
      </div>

      {/* ── Toggle collapse ── */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className={`
          absolute -right-3 top-[68px]
          w-6 h-6 rounded-full
          flex items-center justify-center
          border transition-all duration-150 z-10
          ${
            isDark
              ? 'bg-[#111827] border-white/[0.12] text-[#9ca3af] hover:text-[#f9fafb] hover:border-white/25'
              : 'bg-white border-black/[0.10] text-[#9ca3af] hover:text-[#111827] hover:border-black/20 shadow-sm'
          }
        `}
        aria-label={collapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
      >
        <span
          className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
        >
          {icons.chevron}
        </span>
      </button>
    </aside>
  );
}

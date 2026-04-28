'use client';
import { useState, useSyncExternalStore, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/useContext';
import Image from 'next/image';
import {
  Home,
  LayoutDashboard,
  Calendar,
  Users,
  Ticket,
  Trophy,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  MessageSquare,
  ClipboardList,
  ChevronDown,
} from 'lucide-react';

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

// ─── Types ────────────────────────────────────────────────────────────────────
type SubNavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  isExternal?: boolean;
  children?: SubNavItem[];
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

// ─── Nav groups ───────────────────────────────────────────────────────────────
const navGroups: NavGroup[] = [
  {
    label: 'Navigation',
    items: [
      {
        href: '/frontend/page/event',
        label: 'Accueil site',
        icon: <Home className="w-4 h-4" />,
        isExternal: true,
      },
      {
        href: '/frontend/admin/page',
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
    ],
  },
  {
    label: 'Principal',
    items: [
      {
        href: '/frontend/admin/page/events',
        label: 'Événements',
        icon: <Calendar className="w-4 h-4" />,
      },
      {
        href: '/frontend/admin/page/users',
        label: 'Utilisateurs',
        icon: <Users className="w-4 h-4" />,
      },
    ],
  },
  {
    label: 'Gestion',
    items: [
      {
        href: '/frontend/admin/page/controller',
        label: 'Contrôleurs',
        icon: <Ticket className="w-4 h-4" />,
      },
      {
        href: '/frontend/admin/page/lottery',
        label: 'Tombola',
        icon: <Trophy className="w-4 h-4" />,
      },
    ],
  },
  {
    label: 'Système',
    items: [
      {
        href: '/frontend/admin/page/analytics',
        label: 'Analytics',
        icon: <BarChart3 className="w-4 h-4" />,
      },
      {
        href: '/frontend/admin/page/settings',
        label: 'Paramètres',
        icon: <Settings className="w-4 h-4" />,
        children: [
          {
            href: '/frontend/admin/page/settings/whatsApp',
            label: 'Logs WhatsApp',
            icon: <MessageSquare className="w-3.5 h-3.5" />,
          },
          {
            href: '/frontend/admin/page/settings/audit',
            label: 'Audit',
            icon: <ClipboardList className="w-3.5 h-3.5" />,
          },
        ],
      },
    ],
  },
];

// ─── SubNavLink ───────────────────────────────────────────────────────────────
function SubNavLink({
  href,
  label,
  icon,
  isActive,
  isDark,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  isDark: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        group relative flex items-center gap-2.5 pl-9 pr-3 py-2 rounded-lg
        transition-all duration-150 font-['Inter',sans-serif]
        ${
          isActive
            ? isDark
              ? 'bg-[#0d9488]/15 text-[#f9fafb]'
              : 'bg-[#0d9488]/10 text-[#111827]'
            : isDark
              ? 'text-[#6b7280] hover:bg-white/[0.04] hover:text-[#d1d5db]'
              : 'text-[#9ca3af] hover:bg-[#0d9488]/[0.06] hover:text-[#374151]'
        }
      `}
    >
      {/* Ligne verticale connecteur */}
      <span
        className={`
          absolute left-[18px] top-0 bottom-0 w-px
          ${isDark ? 'bg-white/[0.08]' : 'bg-black/[0.08]'}
        `}
      />

      {/* Ligne horizontale connecteur */}
      <span
        className={`
          absolute left-[18px] top-1/2 w-3 h-px
          ${isDark ? 'bg-white/[0.08]' : 'bg-black/[0.08]'}
        `}
      />

      {/* Dot actif */}
      {isActive && (
        <span className="absolute left-[15px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#0d9488] z-10" />
      )}

      {/* Icon */}
      <span className={`flex-shrink-0 ${isActive ? 'text-[#0d9488]' : ''}`}>
        {icon}
      </span>

      {/* Label */}
      <span className="text-[12px] font-medium whitespace-nowrap">{label}</span>
    </Link>
  );
}

// ─── NavLink ──────────────────────────────────────────────────────────────────
function NavLink({
  href,
  label,
  icon,
  isActive,
  collapsed,
  isDark,
  isMobile = false,
  hasChildren,
  isOpen,
  onToggle,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  collapsed: boolean;
  isDark: boolean;
  isMobile?: boolean;
  hasChildren?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  // Si le lien a des enfants, on gère le clic pour toggle sans naviguer
  if (hasChildren && onToggle) {
    return (
      <button
        onClick={onToggle}
        className={`
          group relative flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left
          transition-all duration-150 font-['Inter',sans-serif]
          ${isMobile ? 'flex-col gap-1 px-2 py-2' : ''}
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
        {isActive && !isMobile && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#0d9488]" />
        )}

        {/* Icon */}
        <span
          className={`flex-shrink-0 transition-colors duration-150 ${
            isActive ? 'text-[#0d9488]' : ''
          }`}
        >
          {icon}
        </span>

        {/* Label */}
        {!collapsed && (
          <span className="text-[13px] font-medium whitespace-nowrap flex-1">
            {label}
          </span>
        )}

        {/* Chevron pour sous-menu */}
        {!collapsed && (
          <ChevronDown
            className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            } ${isActive ? 'text-[#0d9488]' : ''}`}
          />
        )}

        {/* Tooltip collapsed */}
        {collapsed && !isMobile && (
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
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={`
        group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
        transition-all duration-150 font-['Inter',sans-serif]
        ${isMobile ? 'flex-col gap-1 px-2 py-2' : ''}
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
      {/* Barre active (desktop uniquement) */}
      {isActive && !isMobile && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#0d9488]" />
      )}

      {/* Dot active (mobile) */}
      {isActive && isMobile && (
        <span className="absolute top-1 right-1/2 translate-x-1/2 w-1 h-1 rounded-full bg-[#0d9488]" />
      )}

      {/* Icon */}
      <span
        className={`flex-shrink-0 transition-colors duration-150 ${
          isActive ? 'text-[#0d9488]' : ''
        }`}
      >
        {icon}
      </span>

      {/* Label */}
      <span
        className={`
          text-[13px] font-medium whitespace-nowrap
          transition-[opacity,transform] duration-200
          ${isMobile ? 'text-[10px]' : ''}
          ${
            collapsed && !isMobile
              ? 'opacity-0 -translate-x-2 pointer-events-none w-0'
              : 'opacity-100 translate-x-0'
          }
        `}
      >
        {label}
      </span>

      {/* Tooltip collapsed (desktop uniquement) */}
      {collapsed && !isMobile && (
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // État des sous-menus ouverts : clé = href de l'item parent
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerSnapshot,
  );

  // Détecter si mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-ouvrir le sous-menu si une sous-route est active
  useEffect(() => {
    navGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children) {
          const hasActiveChild = item.children.some(
            (child) =>
              pathname === child.href || pathname.startsWith(child.href),
          );
          if (hasActiveChild) {
            setOpenSubMenus((prev) => ({ ...prev, [item.href]: true }));
          }
        }
      });
    });
  }, [pathname]);

  const toggleSubMenu = (href: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  const handleLogout = (): void => {
    setIsLoggingOut(true);
    logout();
    router.push('/frontend/page/login');
  };

  // Navigation items principales pour le bottom nav mobile
  const mobileNavItems = [
    {
      href: '/frontend/page/event',
      label: 'Accueil',
      icon: <Home className="w-5 h-5" />,
    },
    {
      href: '/frontend/admin/page',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      href: '/frontend/admin/page/events',
      label: 'Événements',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      href: '/frontend/admin/page/lottery',
      label: 'Tombola',
      icon: <Trophy className="w-5 h-5" />,
    },
  ];

  // Helper : est-ce qu'un item (ou ses enfants) est actif ?
  const isItemActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some(
        (child) => pathname === child.href || pathname.startsWith(child.href),
      );
    }
    return (
      pathname === item.href ||
      (item.href !== '/frontend/admin/page' && pathname.startsWith(item.href))
    );
  };

  // ─── Rendu d'un item nav avec sous-menu éventuel ──────────────────────────
  const renderNavItem = (
    item: NavItem,
    opts: { collapsed: boolean; isMobile?: boolean },
  ) => {
    const { collapsed, isMobile = false } = opts;
    const isActive = isItemActive(item);
    const hasChildren = !!(item.children && item.children.length > 0);
    const isOpen = openSubMenus[item.href] ?? false;

    return (
      <div key={item.href}>
        <NavLink
          href={item.href}
          label={item.label}
          icon={item.icon}
          isActive={isActive}
          collapsed={collapsed}
          isDark={isDark}
          isMobile={isMobile}
          hasChildren={hasChildren}
          isOpen={isOpen}
          onToggle={hasChildren ? () => toggleSubMenu(item.href) : undefined}
        />

        {/* Sous-menu dépliable */}
        {hasChildren && !collapsed && (
          <div
            className={`
              overflow-hidden transition-all duration-250 ease-in-out
              ${isOpen ? 'max-h-40 opacity-100 mt-0.5' : 'max-h-0 opacity-0'}
            `}
          >
            <div className="flex flex-col gap-0.5 ml-1 pb-1">
              {item.children!.map((child) => {
                const childActive =
                  pathname === child.href || pathname.startsWith(child.href);
                return (
                  <SubNavLink
                    key={child.href}
                    href={child.href}
                    label={child.label}
                    icon={child.icon}
                    isActive={childActive}
                    isDark={isDark}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Sous-menu en tooltip quand collapsed */}
        {hasChildren && collapsed && isOpen && (
          <div
            className={`
              absolute left-full ml-2 top-0 z-50 min-w-[160px]
              rounded-xl shadow-xl border p-1.5
              ${isDark ? 'bg-[#111827] border-white/[0.12]' : 'bg-white border-black/[0.08]'}
            `}
          >
            {item.children!.map((child) => {
              const childActive =
                pathname === child.href || pathname.startsWith(child.href);
              return (
                <SubNavLink
                  key={child.href}
                  href={child.href}
                  label={child.label}
                  icon={child.icon}
                  isActive={childActive}
                  isDark={isDark}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ─── Rendu Mobile (Bottom Navigation) ────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {/* Menu burger pour accès complet */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={`
            fixed top-4 left-4 z-40 p-3 rounded-xl shadow-lg
            transition-all duration-150
            ${
              isDark
                ? 'bg-[#111827] border border-white/10 text-white'
                : 'bg-white border border-black/10 text-gray-900'
            }
          `}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Menu mobile complet (drawer) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <aside
              className={`
                absolute left-0 top-0 bottom-0 w-[280px]
                flex flex-col shadow-2xl
                animate-slide-in-left
                ${isDark ? 'bg-[#030712]' : 'bg-white'}
              `}
            >
              {/* Header */}
              <div
                className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}
              >
                <Link
                  href="/frontend/page/event"
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand/50">
                    <Image
                      src="/images/icon_profile.jpg"
                      width={40}
                      height={40}
                      alt="Logo"
                      className="object-cover"
                    />
                  </div>
                  <span
                    className={`font-['Space_Grotesk',sans-serif] text-lg font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Admin<span className="text-[#f97316]">.</span>
                  </span>
                </Link>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav complète */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
                {navGroups.map((group) => (
                  <div key={group.label}>
                    <p
                      className={`text-[10px] uppercase tracking-wider font-semibold px-2 mb-2 ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}
                    >
                      {group.label}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) =>
                        renderNavItem(item, { collapsed: false }),
                      )}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Footer */}
              <div
                className={`px-3 py-4 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}
              >
                <div className="flex items-center gap-3 px-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 overflow-hidden ${
                      isDark
                        ? 'bg-[#0d9488]/20 border-[#0d9488]/40'
                        : 'bg-[#0d9488]/10 border-[#0d9488]/30'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-brand/10 flex-shrink-0 shadow-lg">
                      <Image
                        src="/images/icon_profile.jpg"
                        width={40}
                        height={40}
                        alt="Logo Admin"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {user?.name ?? 'Administrateur'}
                    </p>
                    <p
                      className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {user?.email ?? 'admin@site.ci'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-150
                    ${
                      isDark
                        ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                        : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                    }
                  `}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
                  </span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Bottom Navigation */}
        <nav
          className={`
            fixed bottom-0 left-0 right-0 z-30
            border-t backdrop-blur-xl
            ${
              isDark
                ? 'bg-[#030712]/95 border-white/10'
                : 'bg-white/95 border-black/10'
            }
          `}
        >
          <div className="grid grid-cols-4 gap-1 px-2 py-2 safe-area-inset-bottom">
            {mobileNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href);
              return (
                <NavLink
                  key={item.href}
                  {...item}
                  isActive={isActive}
                  collapsed={false}
                  isDark={isDark}
                  isMobile={true}
                />
              );
            })}
          </div>
        </nav>
      </>
    );
  }

  // ─── Rendu Desktop (Sidebar classique) ───────────────────────────────────
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
      {/* Logo */}
      <Link href="/frontend/page/event">
        <div
          className={`
            flex items-center gap-3 px-5 py-5
            border-b overflow-hidden cursor-pointer
            transition-colors duration-150
            ${isDark ? 'border-white/[0.07] hover:bg-white/[0.02]' : 'border-black/[0.07] hover:bg-gray-50'}
          `}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand/10 flex-shrink-0 shadow-lg">
            <Image
              src="/images/icon_profile.jpg"
              width={40}
              height={40}
              alt="Logo Admin"
              className="object-cover"
            />
          </div>

          <span
            className={`
              font-['Space_Grotesk',sans-serif] text-[15px] font-bold tracking-tight
              whitespace-nowrap transition-[opacity,transform] duration-200
              ${isDark ? 'text-[#f9fafb]' : 'text-[#111827]'}
              ${
                collapsed
                  ? 'opacity-0 -translate-x-2 pointer-events-none'
                  : 'opacity-100 translate-x-0'
              }
            `}
          >
            Admin<span className="text-[#f97316]">.</span>
          </span>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-4 px-3 py-4 flex-1 overflow-y-auto overflow-x-hidden">
        {navGroups.map((group) => (
          <div key={group.label}>
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
              {group.items.map((item) => renderNavItem(item, { collapsed }))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
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
              w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
              border-2 overflow-hidden
              ${
                isDark
                  ? 'bg-[#0d9488]/20 border-[#0d9488]/40'
                  : 'bg-[#0d9488]/10 border-[#0d9488]/30'
              }
            `}
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-brand/10 flex-shrink-0 shadow-lg">
              <Image
                src="/images/icon_profile.jpg"
                width={40}
                height={40}
                alt="Logo Admin"
                className="object-cover"
              />
            </div>
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p
                className={`text-[12px] font-semibold truncate ${
                  isDark ? 'text-[#f9fafb]' : 'text-[#111827]'
                }`}
              >
                {user?.name ?? 'Administrateur'}
              </p>
              <p
                className={`text-[10px] truncate ${
                  isDark ? 'text-[#6b7280]' : 'text-[#9ca3af]'
                }`}
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
          <LogOut className={`w-4 h-4 ${isLoggingOut ? 'animate-spin' : ''}`} />
          {!collapsed && (
            <span className="text-[12px] font-medium">
              {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
            </span>
          )}
        </button>
      </div>

      {/* Toggle collapse */}
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
        <ChevronRight
          className={`w-4 h-4 transition-transform duration-300 ${
            collapsed ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Styles pour l'animation */}
      <style jsx>{`
        @keyframes slide-in-left {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out;
        }

        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </aside>
  );
}

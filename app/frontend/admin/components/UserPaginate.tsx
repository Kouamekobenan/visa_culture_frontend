'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { User } from '../../module/authentification/domain/entities/user.entity';
import { UserRepository } from '../../module/authentification/infrastructure/user.repository';
import { UserRole } from '@/app/frontend/utils/types/manager.type';
import { FiltreUserDto } from '../../module/authentification/application/user.service';

const userRepository = new UserRepository();

const ROLES: Array<UserRole | 'ALL'> = [
  'ALL',
  UserRole.ADMIN,
  UserRole.CONTROLLER,
  UserRole.ORGANIZER,
  UserRole.PARTICIPANT,
];

const getRoleBadge = (role: string) => {
  const map: Record<string, string> = {
    ADMIN:
      'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-700',
    MANAGER:
      'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border border-teal-200 dark:border-teal-700',
    USER: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
  };
  return map[role] ?? map['USER'];
};
const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const avatarColors = [
  'from-teal-400 to-teal-600',
  'from-orange-400 to-orange-600',
  'from-green-400 to-green-600',
  'from-sky-400 to-sky-600',
  'from-violet-400 to-violet-600',
];

const getAvatarColor = (name: string) =>
  avatarColors[name.charCodeAt(0) % avatarColors.length];

// ── Skeleton Row ──────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-b border-gray-100 dark:border-gray-800 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4" />
      </td>
    ))}
  </tr>
);

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = () => (
  <tr>
    <td colSpan={5} className="py-20 text-center">
      <div className="flex flex-col items-center gap-3 text-muted">
        <svg
          className="w-12 h-12 opacity-30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <p className="font-medium text-sm">Aucun utilisateur trouvé</p>
        <p className="text-xs opacity-60">
          Essayez d&apos;ajuster vos filtres de recherche
        </p>
      </div>
    </td>
  </tr>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [role, setRole] = useState<UserRole | 'ALL'>('ALL');

  const [searchEmail, setSearchEmail] = useState('');
  const [searchName, setSearchName] = useState<string>();
  const [searchPhone, setSearchPhone] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.ceil(total / limit);

  const fetchUsers = useCallback(
    async (p: number, r: UserRole | 'ALL', filters: FiltreUserDto) => {
      setLoading(true);
      try {
        const res = await userRepository.paginateSearch(p, limit, filters, r);
        setUsers(res.data);
        setTotal(res.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchUsers(1, role, {
        email: searchEmail || '',
        name: searchName || '',
        phone: searchPhone,
      });
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchEmail, searchName, searchPhone, role, fetchUsers]);

  useEffect(() => {
    fetchUsers(page, role, { email: searchEmail, name: searchName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleRoleChange = (r: UserRole | 'ALL') => {
    setRole(r);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-10">
      {/* ── Header ── */}
      <div className="mb-8 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 rounded-full bg-brand" />
          <h1 className="text-2xl sm:text-3xl font-title font-bold text-title">
            Espace des utilisateurs
          </h1>
        </div>
        <p className="text-muted text-sm ml-5 pl-0.5">
          {loading
            ? 'Chargement…'
            : `${total} membre${total > 1 ? 's' : ''} au total`}
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="bg-surface rounded-2xl border border-gray-200/60 dark:border-gray-700/60 p-4 mb-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-3">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Email */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3 flex items-center text-muted pointer-events-none">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <input
                type="email"
                placeholder="Rechercher par email…"
                value={searchEmail ?? ''}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-background text-foreground text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-transparent transition"
              />
            </div>

            {/* Name */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3 flex items-center text-muted pointer-events-none">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Rechercher par nom…"
                value={searchName ?? ''}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-background text-foreground text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Role tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  role === r
                    ? 'bg-brand text-white shadow-md shadow-brand/20 scale-105'
                    : 'bg-background border border-gray-200/80 dark:border-gray-700/80 text-muted hover:border-brand hover:text-brand'
                }`}
              >
                {r === 'ALL' ? 'Tous' : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table desktop ── */}
      <div className="hidden sm:block bg-surface rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-800/40 border-b border-gray-200/60 dark:border-gray-700/60">
                <th className="px-5 py-4 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Email
                </th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Inscrit le
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 dark:divide-gray-700/40">
              {loading ? (
                [...Array(limit)].map((_, i) => <SkeletonRow key={i} />)
              ) : users.length === 0 ? (
                <EmptyState />
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-gray-800/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarColor(
                            user.name ?? 'U',
                          )} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                        >
                          {getInitials(user.name ?? '?')}
                        </div>
                        <span className="font-medium text-foreground truncate max-w-[140px]">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted text-sm truncate max-w-[180px]">
                      {user.email}
                    </td>
                    <td className="px-5 py-4 text-muted text-sm truncate max-w-[160px]">
                      {user.phone ?? '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getRoleBadge(
                          user.role,
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-muted">Actif</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted text-xs">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Cards mobile ── */}
      <div className="sm:hidden flex flex-col gap-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl border border-gray-200/60 dark:border-gray-700/60 p-4 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-100 dark:bg-gray-700 rounded-full w-2/3" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-muted flex flex-col items-center gap-2">
            <svg
              className="w-10 h-10 opacity-30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-sm font-medium">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-surface rounded-2xl border border-gray-200/60 dark:border-gray-700/60 p-4 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(
                    user.name ?? 'U',
                  )} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                >
                  {getInitials(user.name ?? '?')}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                </div>
                <span
                  className={`ml-auto inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${getRoleBadge(
                    user.role,
                  )}`}
                >
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted pt-2.5 border-t border-gray-100/80 dark:border-gray-700/40">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Actif
                </span>
                <span>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted order-2 sm:order-1">
            Page {page} sur {totalPages} — {total} résultat
            {total > 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            {/* Prev */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200/80 dark:border-gray-700/80 text-muted hover:border-brand hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Numéros de pages */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .reduce<(number | '…')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '…' ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="w-9 h-9 flex items-center justify-center text-muted text-sm"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-150 ${
                      page === p
                        ? 'bg-brand text-white shadow-md shadow-brand/20 scale-105'
                        : 'border border-gray-200/80 dark:border-gray-700/80 text-muted hover:border-brand hover:text-brand'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}

            {/* Next */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200/80 dark:border-gray-700/80 text-muted hover:border-brand hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

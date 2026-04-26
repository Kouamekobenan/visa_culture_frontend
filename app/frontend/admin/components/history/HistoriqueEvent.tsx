'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Printer,
  User,
  CreditCard,
  Calendar,
  Search,
  ArrowRight,
  ArrowLeft,
  Ticket as TicketIcon,
  TrendingUp,
  CheckCircle2,
  Clock,
  Filter,
  X,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { Ticket } from '@/app/frontend/module/tickets/domain/entities/ticket.entity';
import { TicketRepository } from '@/app/frontend/module/tickets/infrastructure/ticket.repository';
import { PaginatedResponseRepository } from '@/app/frontend/utils/types/manager.type';
import { handlePrintTicket } from '../printTicket/PrintfTicket';
import { Button } from '@/app/frontend/components/ui/Button';
import { formatDate } from '@/app/frontend/utils/types/conversion.data';

const ticketRepository = new TicketRepository();
const LIMIT = 10;

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-foreground/8 bg-surface px-4 py-3 transition-shadow hover:shadow-sm">
      <div className={`rounded-lg p-2 ${accent}`}>{icon}</div>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="font-title text-lg font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function TicketTypeBadge({ name }: { name: string }) {
  const map: Record<string, string> = {
    VVIP: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    VIP: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    'GRAND PUBLIC':
      'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${map[name] ?? 'bg-surface text-muted'}`}
    >
      {name}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string; dot: string }> = {
    VALID: {
      cls: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
      label: 'Valide',
      dot: 'bg-green-500',
    },
    USED: {
      cls: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
      label: 'Utilisé',
      dot: 'bg-gray-400',
    },
    CANCELLED: {
      cls: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300',
      label: 'Annulé',
      dot: 'bg-red-500',
    },
  };
  const s = map[status] ?? map['USED'];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function PaymentBadge({
  status,
  provider,
}: {
  status: string;
  provider?: string;
}) {
  const isPaid = status === 'PAID' || status === 'COMPLETED';
  return (
    <div className="flex items-center gap-2">
      <div
        className={`rounded-full p-1.5 ${isPaid ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}
      >
        <CreditCard size={13} />
      </div>
      <div>
        <p className="text-xs font-bold text-foreground">{provider ?? '—'}</p>
        <p
          className={`text-[10px] font-semibold uppercase ${isPaid ? 'text-green-600' : 'text-amber-500'}`}
        >
          {status}
        </p>
      </div>
    </div>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-foreground/5">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-3 rounded-full bg-foreground/8 w-3/4" />
          <div className="mt-2 h-2 rounded-full bg-foreground/5 w-1/2" />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HistoryEvent({ eventId }: { eventId: string }) {
  const [ticketData, setTicketData] =
    useState<PaginatedResponseRepository<Ticket> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const res = await ticketRepository.findAllByEventId(
          eventId,
          LIMIT,
          page,
        );
        setTicketData(res);
      } catch (err) {
        console.error('Erreur de récupération:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [eventId, page],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Client-side filtering on the current page
  const filteredTickets = useMemo(() => {
    if (!ticketData?.data) return [];
    return ticketData.data.filter((t) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        t.code.toLowerCase().includes(q) ||
        (t.user?.name ?? '').toLowerCase().includes(q) ||
        (t.scannedBy?.name ?? '').toLowerCase().includes(q);
      const matchType = !typeFilter || t.ticketType?.name === typeFilter;
      const matchStatus = !statusFilter || t.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [ticketData, search, typeFilter, statusFilter]);
  // Stats computed from full page data (not filtered)
  const stats = useMemo(() => {
    const all = ticketData?.data ?? [];
    return {
      total: ticketData?.total ?? 0,
      valid: all.filter((t) => t.status === 'VALID').length,
      pending: all.filter((t) => t.payment?.status === 'PENDING').length,
      revenue: all.reduce((s, t) => s + (t.ticketType?.price ?? 0), 0),
    };
  }, [ticketData]);

  const hasActiveFilters = search || typeFilter || statusFilter;
  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setStatusFilter('');
  };

  return (
    <div className="flex flex-col gap-6 bg-background p-3">
      {/* ── Header ── */}
      <div className="flex flex-col bg-background  gap-1 px-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-title text-2xl font-bold text-title tracking-tight">
            Historique des ventes
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            Suivi détaillé des émissions de tickets • Page {page} /{' '}
            {ticketData?.totalPages ?? '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/10 bg-surface px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-foreground/5 disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Actualiser
          </button>
          <Link href={`/frontend/admin/page/events/edit/${eventId}`}>
            <Button variant="outline" size="sm">
              ← Retour
            </Button>
          </Link>
        </div>
      </div>
      <div className="w-full h-1.5 bg-brand"></div>
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-4">
        <StatCard
          icon={<TicketIcon size={16} className="text-brand" />}
          label="Total tickets"
          value={stats.total}
          accent="bg-brand/10"
        />
        <StatCard
          icon={<CheckCircle2 size={16} className="text-brand" />}
          label="Valides (page)"
          value={stats.valid}
          accent="bg-brand/10 "
        />
        <StatCard
          icon={<Clock size={16} className="text-brand" />}
          label="Paiements en attente"
          value={stats.pending}
          accent="bg-brand/10 "
        />
        <StatCard
          icon={<TrendingUp size={16} className="text-brand" />}
          label="CA (page)"
          value={formatPrice(stats.revenue)}
          accent="bg-brand/10 "
        />
      </div>

      {/* ── Table card ── */}
      <div className="overflow-hidden  border border-foreground/8 bg-background shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-foreground/8 bg-surface/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              size={15}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Code ticket, acheteur, contrôleur…"
              className="w-full rounded-lg border border-foreground/10 bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder-muted outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                hasActiveFilters
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-foreground/10 bg-background text-foreground hover:bg-foreground/5'
              }`}
            >
              <Filter size={13} />
              Filtres
              {hasActiveFilters && (
                <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                  {[typeFilter, statusFilter].filter(Boolean).length}
                </span>
              )}
              <ChevronDown
                size={12}
                className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-lg border border-foreground/10 bg-background px-3 py-2 text-xs font-medium text-muted transition-all hover:text-foreground"
              >
                <X size={12} />
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 border-b border-foreground/8 bg-surface/30 px-5 py-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Type de billet
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-foreground/10 bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                <option value="">Tous</option>
                <option value="VIP">VIP</option>
                <option value="VVIP">VVIP</option>
                <option value="GRAND PUBLIC">Grand public</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Statut ticket
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-foreground/10 bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                <option value="">Tous</option>
                <option value="VALID">Valide</option>
                <option value="USED">Utilisé</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </div>
          </div>
        )}

        {/* Results count */}
        {hasActiveFilters && !loading && (
          <div className="border-b border-foreground/8 bg-brand/5 px-5 py-2">
            <p className="text-xs text-brand font-medium">
              {filteredTickets.length} résultat
              {filteredTickets.length !== 1 ? 's' : ''} filtré
              {filteredTickets.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-foreground/8 bg-surface/40">
                {[
                  '#',
                  'Référence & Client',
                  'Contrôleur',
                  'Type de billet',
                  'Transaction',
                  'Statut',
                  'Action',
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted ${i === 0 ? 'w-10' : ''} ${i === 6 ? 'text-right' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {loading ? (
                [...Array(LIMIT)].map((_, i) => <SkeletonRow key={i} />)
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <TicketIcon size={32} className="text-foreground/15" />
                      <p className="text-sm font-medium text-muted">
                        Aucun ticket trouvé
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-xs text-brand underline underline-offset-2"
                        >
                          Réinitialiser les filtres
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket, idx) => (
                  <tr
                    key={ticket.id}
                    className="group transition-colors hover:bg-surface/60"
                  >
                    {/* Index */}
                    <td className="px-5 py-4 text-xs text-muted font-medium">
                      {(page - 1) * LIMIT + idx + 1}
                    </td>

                    {/* Code + Acheteur */}
                    <td className="px-5 py-4">
                      <p className="font-mono text-sm font-bold text-brand tracking-wide">
                        {ticket.code}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-muted">
                        <User size={11} />
                        <span className="text-[11px]">
                          {ticket.user?.name ?? 'Acheteur anonyme'}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-muted">
                        <Calendar size={11} />
                        <span className="text-[11px]">
                          {formatDate(ticket.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* Contrôleur */}
                    <td className="px-5 py-4">
                      {ticket.scannedBy ? (
                        <>
                          <div className="flex items-center gap-1.5">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand">
                              <User size={11} />
                            </div>
                            <span className="text-xs font-semibold text-foreground">
                              {ticket.scannedBy.name}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-muted pl-7">
                            {ticket.scannedBy.phone}
                          </p>
                        </>
                      ) : (
                        <span className="text-[11px] text-muted italic">
                          Non scanné
                        </span>
                      )}
                    </td>

                    {/* Type billet */}
                    <td className="px-5 py-4">
                      <TicketTypeBadge name={ticket.ticketType?.name ?? '—'} />
                      <p className="mt-1.5 text-[10px] font-semibold text-muted uppercase tracking-wide">
                        {formatPrice(ticket.ticketType?.price ?? 0)}
                      </p>
                    </td>

                    {/* Transaction */}
                    <td className="px-5 py-4">
                      <PaymentBadge
                        status={ticket.payment?.status ?? '—'}
                        provider={ticket.payment?.provider}
                      />
                    </td>

                    {/* Statut */}
                    <td className="px-5 py-4">
                      <StatusBadge status={ticket.status} />
                      {ticket.scannedAt && (
                        <p className="mt-1 text-[10px] text-muted">
                          Scanné {formatDate(ticket.scannedAt)}
                        </p>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handlePrintTicket(ticket)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/10 bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-all hover:border-brand/40 hover:bg-brand/5 hover:text-brand group-hover:border-brand/20"
                      >
                        <Printer size={13} />
                        Imprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-foreground/8 bg-surface/40 px-5 py-3">
          <p className="text-xs text-muted font-medium">
            {loading ? (
              <span className="inline-block h-3 w-40 animate-pulse rounded-full bg-foreground/10" />
            ) : (
              <>
                <span className="font-semibold text-foreground">
                  {filteredTickets.length}
                </span>{' '}
                affiché
                {filteredTickets.length !== 1 ? 's' : ''} sur{' '}
                <span className="font-semibold text-foreground">
                  {ticketData?.total ?? 0}
                </span>{' '}
                tickets
              </>
            )}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/10 bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft size={13} />
              Précédent
            </button>

            {/* Page numbers */}
            <div className="hidden items-center gap-1 sm:flex">
              {Array.from(
                { length: ticketData?.totalPages ?? 0 },
                (_, i) => i + 1,
              )
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    disabled={loading}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                      p === page
                        ? 'bg-btn text-white shadow-sm'
                        : 'border border-foreground/10 bg-background text-foreground hover:bg-foreground/5'
                    }`}
                  >
                    {p}
                  </button>
                ))}
            </div>

            <button
              disabled={page >= (ticketData?.totalPages ?? 1) || loading}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/10 bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suivant
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

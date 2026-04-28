'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Shield,
  Calendar,
} from 'lucide-react';
import { PaginatedResponseRepository } from '../../utils/types/manager.type';
import { WhatsAppLogEntity } from '../../module/whatsApp/domain/entities/whatsApp.entity';
import { WhatsAppRepository } from '../../module/whatsApp/infrastructure/whatsAppRepository';
import { formatShortDate } from '../../utils/types/conversion.data';

const whatsAppService = new WhatsAppRepository();

// --- Types ---
type StatusFilter = 'ALL' | 'SENT' | 'FAILED';

// --- UserModal ---
function UserModal({
  log,
  onClose,
}: {
  log: WhatsAppLogEntity;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-surface border border-muted/10 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-violet-500" />

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-brand mb-1">
              Destinataire
            </div>
            <h2 className="text-xl font-black text-title">
              {log.user?.name ?? '—'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-background border border-muted/10 text-muted hover:text-title transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-3">
          {[
            {
              icon: <Mail className="w-4 h-4" />,
              label: 'Email',
              value: log.user?.email,
            },
            {
              icon: <Phone className="w-4 h-4" />,
              label: 'Téléphone',
              value: log.user?.phone,
            },
            {
              icon: <Shield className="w-4 h-4" />,
              label: 'Rôle',
              value: log.user?.role,
            },
            {
              icon: <Calendar className="w-4 h-4" />,
              label: 'Créé le',
              value: log.user?.createdAt
                ? formatShortDate(log.user.createdAt)
                : '—',
            },
            {
              icon: <Calendar className="w-4 h-4" />,
              label: 'Mis à jour',
              // Par :
              value: log.user?.createdAt
                ? formatShortDate(log.user.createdAt.toString())
                : '—',
            },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-3 p-3 bg-background rounded-xl border border-muted/5"
            >
              <span className="text-brand">{row.icon}</span>
              <span className="text-xs font-bold text-muted w-20 shrink-0">
                {row.label}
              </span>
              <span className="text-sm font-semibold text-title truncate">
                {row.value ?? '—'}
              </span>
            </div>
          ))}

          {/* Message context */}
          <div className="mt-2 p-4 bg-background rounded-xl border border-muted/5 space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-muted mb-2">
              Contexte du message
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted font-medium">Type</span>
              <span className="font-bold text-title">{log.type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted font-medium">Événement</span>
              <span className="font-bold text-title truncate max-w-[180px]">
                {log.eventName ?? '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted font-medium">Envoyé le</span>
              <span className="font-bold text-title">
                {formatShortDate(log.sentAt)}
              </span>
            </div>
          </div>

          {/* Error message if any */}
          {log.errorMessage && (
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
              <div className="text-[11px] font-black uppercase tracking-wider text-red-400 mb-1">
                Erreur
              </div>
              <p className="text-sm text-red-400 font-medium">
                {log.errorMessage}
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// --- Status Badge ---
function StatusBadge({ status }: { status: string }) {
  const isSuccess = status === 'SENT';
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full"
      style={{
        background: isSuccess ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
        color: isSuccess ? '#10b981' : '#ef4444',
      }}
    >
      {isSuccess ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {status}
    </span>
  );
}

// --- Filter Tab ---
function FilterTab({
  label,
  count,
  active,
  color,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
      style={{
        background: active ? `${color}15` : 'transparent',
        color: active ? color : '#64748b',
        border: `1.5px solid ${active ? color : 'transparent'}`,
      }}
    >
      {label}
      <span
        className="text-xs font-black px-2 py-0.5 rounded-full"
        style={{
          background: active ? color : 'rgba(100,116,139,0.1)',
          color: active ? '#fff' : '#64748b',
        }}
      >
        {count}
      </span>
    </button>
  );
}

// --- Pagination ---
function Pagination({
  currentPage,
  totalPages,
  onPage,
}: {
  currentPage: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
  );

  return (
    <div className="flex items-center justify-center gap-2 pt-6 border-t border-muted/10">
      <button
        onClick={() => onPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl bg-surface border border-muted/10 text-muted disabled:opacity-30 hover:text-title transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) => {
        const prev = pages[i - 1];
        return (
          <>
            {prev && p - prev > 1 && (
              <span key={`gap-${p}`} className="text-muted text-sm px-1">
                …
              </span>
            )}
            <button
              key={p}
              onClick={() => onPage(p)}
              className="w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200"
              style={{
                background: p === currentPage ? '#8b5cf6' : 'transparent',
                color: p === currentPage ? '#fff' : '#64748b',
                border: `1.5px solid ${p === currentPage ? '#8b5cf6' : 'transparent'}`,
              }}
            >
              {p}
            </button>
          </>
        );
      })}

      <button
        onClick={() => onPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl bg-surface border border-muted/10 text-muted disabled:opacity-30 hover:text-title transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// --- Main Component ---
export default function LogsWhatsApp() {
  const [logs, setLogs] =
    useState<PaginatedResponseRepository<WhatsAppLogEntity>>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedLog, setSelectedLog] = useState<WhatsAppLogEntity | null>(
    null,
  );
  const limitPage = 12;

  useEffect(() => {
    const fetchLogsWhatsApp = async () => {
      try {
        const response = await whatsAppService.finddAll(limitPage, currentPage);
        setLogs(response);
        setCurrentPage(response.page);
      } catch (error) {
        console.log('Error during retrieve data');
      }
    };
    fetchLogsWhatsApp();
  }, [currentPage]);

  const allLogs = logs?.data ?? [];
  const filtered =
    statusFilter === 'ALL'
      ? allLogs
      : allLogs.filter((l) => l.status === statusFilter);

  const successCount = allLogs.filter((l) => l.status === 'SENT').length;
  const failedCount = allLogs.filter((l) => l.status === 'FAILED').length;
  const totalPages = logs ? Math.ceil(logs.total / limitPage) : 1;

  return (
    <div className="bg-background min-h-screen text-foreground pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-brand mb-2">
              Traçabilité
            </div>
            <h1 className="text-4xl font-black text-title tracking-tight leading-none uppercase">
              Logs WhatsApp
            </h1>
            <p className="text-sm text-muted mt-2">
              Suivi des notifications envoyées aux utilisateurs
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-muted bg-surface border border-muted/20 px-5 py-2.5 rounded-xl">
            <MessageSquare className="w-4 h-4 text-brand" />
            {allLogs.length} notifications · Page {currentPage}/{totalPages}
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: 'Total envoyés',
              value: allLogs.length,
              accent: '#8b5cf6',
            },
            { label: 'Succès', value: successCount, accent: '#10b981' },
            { label: 'Échecs', value: failedCount, accent: '#ef4444' },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-surface border border-muted/10 rounded-2xl p-5 relative overflow-hidden shadow-sm"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: kpi.accent }}
              />
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1">
                {kpi.label}
              </div>
              <div
                className="text-3xl font-black text-title tabular-nums"
                style={{ color: kpi.accent }}
              >
                {kpi.value.toLocaleString('fr-FR')}
              </div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-surface border border-muted/10 rounded-2xl shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-muted/10">
            <div className="text-lg font-bold text-title">
              Historique des envois
            </div>
            <div className="flex items-center gap-2">
              <FilterTab
                label="Tous"
                count={allLogs.length}
                active={statusFilter === 'ALL'}
                color="#8b5cf6"
                onClick={() => setStatusFilter('ALL')}
              />
              <FilterTab
                label="Succès"
                count={successCount}
                active={statusFilter === 'SENT'}
                color="#10b981"
                onClick={() => setStatusFilter('SENT')}
              />
              <FilterTab
                label="Échecs"
                count={failedCount}
                active={statusFilter === 'FAILED'}
                color="#ef4444"
                onClick={() => setStatusFilter('FAILED')}
              />
            </div>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <MessageSquare className="w-10 h-10 text-muted/30" />
              <p className="text-sm font-bold text-muted">
                Aucune notification{' '}
                {statusFilter !== 'ALL' ? `(${statusFilter})` : ''} pour
                l&apos;instant
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-muted/10">
                    {[
                      '#',
                      'Téléphone',
                      'Type',
                      'Événement',
                      'Statut',
                      "Date d'envoi",
                      'Destinataire',
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left text-[11px] font-black uppercase tracking-wider text-muted px-4 py-3 first:pl-6 last:pr-6"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log, i) => (
                    <tr
                      key={log.id}
                      className="border-b border-muted/5 hover:bg-background/60 transition-colors duration-150"
                    >
                      <td className="pl-6 py-4 text-xs font-black text-muted/40">
                        {String((currentPage - 1) * limitPage + i + 1).padStart(
                          2,
                          '0',
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-title">
                        {log.phone}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-bold bg-brand/10 text-brand px-2.5 py-1 rounded-full">
                          {log.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted font-medium max-w-[180px] truncate">
                        {log.eventName ?? '—'}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="px-4 py-4 text-sm text-muted font-medium whitespace-nowrap">
                        {formatShortDate(log.sentAt)}
                      </td>
                      <td className="px-4 pr-6 py-4">
                        {log.user ? (
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-background border border-muted/10 text-muted hover:text-brand hover:border-brand/30 transition-all duration-150"
                          >
                            <User className="w-3 h-3" />
                            {log.user.name ?? 'Voir'}
                          </button>
                        ) : (
                          <span className="text-xs text-muted/40 font-medium">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPage={(p) => setCurrentPage(p)}
            />
          </div>
        </div>
      </div>

      {/* User Modal */}
      {selectedLog && (
        <UserModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}

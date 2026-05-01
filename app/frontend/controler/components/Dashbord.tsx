'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  ScanLine,
  Clock,
  CheckCircle2,
  DoorOpen,
  User,
  TrendingUp,
  RefreshCw,
  QrCode,
  ChevronRight,
  Ticket,
  Calendar,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { ControllerRepository } from '../module/controller/infrastructure/controllerProfile.repository';
import {
  ControllerDashboardDto,
  RecentScanDto,
} from '../module/controller/domain/interface/dashbord-controlleur.dto';
import Image from 'next/image';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ControllerDashboardProps {
  controllerId: string;
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatTime(dateStr: string | Date | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTimeAgo(dateStr: string | Date | null): string {
  if (!dateStr) return '—';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `il y a ${diff}s`;
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
  return formatTime(dateStr);
}

// ─── Service ──────────────────────────────────────────────────────────────────

const controllerService = new ControllerRepository();

// ─── Sub-components ───────────────────────────────────────────────────────────

function LiveIndicator({ active }: { active: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`w-2 h-2 rounded-full ${active ? 'bg-btn animate-pulse' : 'bg-muted'}`}
      />
      <span
        className={`text-xs font-medium ${active ? 'text-btn' : 'text-muted'}`}
      >
        {active ? 'En direct' : 'Hors ligne'}
      </span>
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`
        relative rounded-2xl p-5 border transition-all duration-300
        ${
          accent
            ? 'bg-brand/10 border-brand/30 shadow-[0_0_24px_rgba(13,148,136,0.08)]'
            : 'bg-surface border-foreground/5'
        }
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`p-2 rounded-xl ${accent ? 'bg-brand/20' : 'bg-foreground/5'}`}
        >
          <Icon
            size={18}
            className={accent ? 'text-brand' : 'text-muted'}
            strokeWidth={1.8}
          />
        </div>
        {accent && (
          <TrendingUp
            size={14}
            className="text-brand opacity-60"
            strokeWidth={2}
          />
        )}
      </div>
      <p className="text-2xl font-bold font-title text-foreground mb-0.5">
        {value}
      </p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function ScanRow({ scan, index }: { scan: RecentScanDto; index: number }) {
  return (
    <div
      className="flex items-center gap-3 py-3 border-b border-foreground/[0.04] last:border-0 group"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Status dot */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-btn/10 flex items-center justify-center">
        <CheckCircle2 size={15} className="text-btn" strokeWidth={2} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground font-mono truncate">
          {scan.code}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-muted truncate">
            {scan.eventTitle}
          </span>
          <span className="text-[11px] text-muted opacity-40">·</span>
          <span className="text-[11px] text-brand">{scan.ticketType}</span>
        </div>
      </div>

      {/* Time */}
      <div className="shrink-0 text-right">
        <p className="text-[12px] text-muted">
          {formatTimeAgo(scan.scannedAt)}
        </p>
      </div>
    </div>
  );
}

function EmptyScans() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center mb-4">
        <Ticket size={24} className="text-muted opacity-50" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-foreground/40">
        Aucun scan pour l&apos;instant
      </p>
      <p className="text-xs text-muted mt-1">
        Les tickets scannés apparaîtront ici
      </p>
    </div>
  );
}

function SkeletonDash() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-20 rounded-2xl bg-foreground/5" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-foreground/5" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-foreground/5" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ControllerDashboard({
  controllerId,
}: ControllerDashboardProps) {
  const [data, setData] = useState<ControllerDashboardDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [online, setOnline] = useState<boolean>(true);

  const fetchDashboard = useCallback(
    async (silent = false): Promise<void> => {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);
      setError(null);
      try {
        const result: ControllerDashboardDto =
          await controllerService.getDashboard(controllerId);
        setData(result);
        setLastRefresh(new Date());
        setOnline(true);
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : 'Impossible de charger le dashboard';
        setError(message);
        setOnline(false);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [controllerId],
  );

  // Initial load
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Polling toutes les 15 secondes
  useEffect(() => {
    const interval = setInterval(() => fetchDashboard(true), 15_000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  function handleGoToScan(): void {
    window.location.href = '/frontend/page/tickets/controller';
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 max-w-2xl mx-auto">
        <SkeletonDash />
      </div>
    );
  }
  if (error && !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center mx-auto mb-4">
            <WifiOff size={28} className="text-error" strokeWidth={1.5} />
          </div>
          <h2 className="font-title text-xl font-bold text-foreground mb-2">
            Connexion perdue
          </h2>
          <p className="text-muted text-sm mb-6">{error}</p>
          <button
            onClick={() => fetchDashboard()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-medium transition-all hover:bg-brand/90 active:scale-95"
          >
            <RefreshCw size={15} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }
  const controller = data?.controller;
  const stats = data?.stats;
  const recentScans: RecentScanDto[] = data?.recentScans ?? [];
  return (
    <div className="min-h-screen bg-background">
      {/* ── Background subtle pattern ── */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative max-w-2xl mx-auto px-4 pt-6 pb-24">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LiveIndicator active={online} />
              {!online && (
                <span className="text-xs text-error flex items-center gap-1">
                  <WifiOff size={11} /> Données en cache
                </span>
              )}
            </div>
            <h1 className="font-title text-2xl sm:text-3xl font-bold text-title leading-tight">
              Dashboard
            </h1>
            <p className="text-muted text-sm mt-0.5">
              Mis à jour à {formatTime(lastRefresh.toISOString())}
            </p>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => fetchDashboard(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-foreground/8 bg-surface text-muted hover:text-foreground hover:border-foreground/20 transition-all active:scale-95 disabled:opacity-40"
          >
            <RefreshCw
              size={16}
              strokeWidth={2}
              className={isRefreshing ? 'animate-spin' : ''}
            />
          </button>
        </div>

        {/* ── Controller profile card ── */}
        <div className="rounded-2xl bg-surface border border-foreground/5 p-4 mb-5 flex items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            {controller?.photoUrl ? (
              <Image
                src="/images/logo.png"
                fill
                priority
                className="object-contain object-left"
                alt="Visa For Culture Logo"
              />
            ) : (
              <div className="relative h-15 w-60 md:h-20 md:w-100">
                <Image
                  src="/images/logo.png"
                  fill
                  priority
                  className="object-contain object-left"
                  alt="Visa For Culture Logo"
                />
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-btn border-2 border-background" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-title font-bold text-foreground text-[17px] leading-snug truncate">
              {controller?.fullName ?? '—'}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {controller?.gate ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-brand bg-brand/10 px-2.5 py-0.5 rounded-full">
                  <DoorOpen size={11} strokeWidth={2} />
                  {controller.gate}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-muted bg-foreground/5 px-2.5 py-0.5 rounded-full">
                  <DoorOpen size={11} strokeWidth={2} />
                  Aucune porte assignée
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <Calendar size={11} strokeWidth={2} />
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <StatCard
            icon={ScanLine}
            label="Scans aujourd'hui"
            value={stats?.totalScannedToday ?? 0}
            accent
          />
          <StatCard
            icon={Clock}
            label="Dernier scan"
            value={formatTime(stats?.lastScanAt.toString() ?? new Date())}
          />
          <div className="col-span-2 sm:col-span-1">
            <StatCard
              icon={Activity}
              label="Statut"
              value={online ? 'Actif' : 'Hors ligne'}
            />
          </div>
        </div>
        {/* ── Recent scans ── */}
        <div className="rounded-2xl bg-surface border border-foreground/5 mb-5 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/5">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-brand" strokeWidth={2} />
              <h3 className="font-title font-semibold text-[15px] text-foreground">
                Scans récents
              </h3>
            </div>
            <span className="text-xs text-muted bg-foreground/5 px-2.5 py-1 rounded-full">
              {recentScans.length} / 10
            </span>
          </div>
          <div className="px-5">
            {recentScans.length === 0 ? (
              <EmptyScans />
            ) : (
              recentScans.map((scan: RecentScanDto, i: number) => (
                <ScanRow key={`${scan.code}-${i}`} scan={scan} index={i} />
              ))
            )}
          </div>
        </div>
        {/* ── Connexion status bar ── */}
        {error && data && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs mb-4">
            <WifiOff size={13} strokeWidth={2} />
            Rafraîchissement échoué — données en cache
          </div>
        )}

        {/* ── Online indicator ── */}
        {online && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-btn/[0.08] border border-btn/20 text-btn text-xs mb-4">
            <Wifi size={13} strokeWidth={2} />
            Synchronisation automatique toutes les 15 secondes
          </div>
        )}
      </div>

      {/* ── Floating Scan CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleGoToScan}
            className="
              w-full flex items-center justify-between gap-3
              px-5 py-4 rounded-2xl
              bg-btn text-background
              font-title font-bold text-[16px]
              shadow-[0_8px_32px_rgba(34,197,94,0.3)]
              transition-all duration-200
              hover:shadow-[0_12px_40px_rgba(34,197,94,0.4)]
              hover:scale-[1.01]
              active:scale-[0.99]
            "
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-background/20 flex items-center justify-center">
                <QrCode size={20} strokeWidth={2} />
              </div>
              <div className="text-left">
                <p className="text-[16px] leading-tight">Scanner un ticket</p>
                <p className="text-[11px] font-normal opacity-70 font-sans mt-0.5">
                  Ouvrir le lecteur QR code
                </p>
              </div>
            </div>
            <ChevronRight size={20} strokeWidth={2.5} className="opacity-70" />
          </button>
        </div>
      </div>
    </div>
  );
}

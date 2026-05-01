'use client';

import { TicketService } from '@/app/frontend/module/tickets/application/ticket.service';
import { HistoriqueTicketDto } from '@/app/frontend/module/tickets/domain/entities/ticket.entity';
import { TicketRepository } from '@/app/frontend/module/tickets/infrastructure/ticket.repository';
import { useQRScanner } from '@/app/frontend/utils/hooks/useQRScanner';
import { formatFullDateTime } from '@/app/frontend/utils/types/conversion.data';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/frontend/context/useContext';
import {
  ScanLine,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  User,
  Phone,
  Ticket,
  CalendarDays,
  RefreshCw,
  Camera,
  CameraOff,
  Square,
  Loader2,
  ShieldCheck,
  Clock,
} from 'lucide-react';

const ticketService = new TicketService(new TicketRepository());

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  VALID: {
    containerClass: 'bg-btn/10 border-btn/40',
    iconBg: 'bg-btn/15',
    icon: CheckCircle2,
    iconClass: 'text-btn',
    title: 'Accès autorisé',
    titleClass: 'text-btn',
    badge: 'bg-btn/20 text-btn border-btn/30',
    badgeLabel: 'VALIDE',
  },
  USED: {
    containerClass: 'bg-title/10 border-title/40',
    iconBg: 'bg-title/15',
    icon: AlertTriangle,
    iconClass: 'text-title',
    title: 'Déjà scanné',
    titleClass: 'text-title',
    badge: 'bg-title/20 text-title border-title/30',
    badgeLabel: 'UTILISÉ',
  },
  CANCELLED: {
    containerClass: 'bg-error/10 border-error/40',
    iconBg: 'bg-error/15',
    icon: XCircle,
    iconClass: 'text-error',
    title: 'Ticket annulé',
    titleClass: 'text-error',
    badge: 'bg-error/20 text-error border-error/30',
    badgeLabel: 'ANNULÉ',
  },
} as const;

// ─── Scan Result Card ─────────────────────────────────────────────────────────

function ScanResultCard({
  result,
  onReset,
}: {
  result: HistoriqueTicketDto;
  onReset: () => void;
}) {
  const status = result?.status ?? 'CANCELLED';
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.CANCELLED;
  const Icon = cfg.icon;

  return (
    <div className="w-full max-w-sm mx-auto animate-in slide-in-from-bottom-4 fade-in duration-300">
      {/* Status header */}
      <div className={`rounded-2xl border p-6 mb-3 ${cfg.containerClass}`}>
        <div className="flex flex-col items-center text-center mb-5">
          <div
            className={`w-20 h-20 rounded-full ${cfg.iconBg} flex items-center justify-center mb-4 shadow-lg`}
          >
            <Icon size={40} className={cfg.iconClass} strokeWidth={1.5} />
          </div>
          <span
            className={`text-[11px] font-bold tracking-[0.12em] uppercase border rounded-full px-3 py-1 mb-3 ${cfg.badge}`}
          >
            {cfg.badgeLabel}
          </span>
          <h2 className={`font-title text-2xl font-bold ${cfg.titleClass}`}>
            {cfg.title}
          </h2>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-foreground/[0.06] mb-5" />

        {/* Ticket details */}
        <div className="space-y-3">
          {result?.buyerName && (
            <InfoRow icon={User} label="Participant" value={result.buyerName} />
          )}
          {result?.buyerPhone && (
            <InfoRow icon={Phone} label="Téléphone" value={result.buyerPhone} />
          )}
          {result?.ticketType && (
            <InfoRow
              icon={Ticket}
              label="Type de ticket"
              value={result.ticketType.name}
              accent
            />
          )}
          {result?.event?.title && (
            <InfoRow
              icon={CalendarDays}
              label="Événement"
              value={result.event.title}
            />
          )}
          {result?.status === 'USED' && result?.createdAt && (
            <InfoRow
              icon={Clock}
              label="Scanné le"
              value={formatFullDateTime(result.createdAt)}
              warning
            />
          )}
        </div>
      </div>

      {/* Action button */}
      <button
        onClick={onReset}
        className="
          w-full flex items-center justify-center gap-2.5
          py-4 rounded-2xl
          bg-btn text-background
          font-title font-bold text-[15px]
          shadow-[0_8px_24px_rgba(34,197,94,0.25)]
          hover:shadow-[0_12px_32px_rgba(34,197,94,0.35)]
          hover:scale-[1.01] active:scale-[0.99]
          transition-all duration-200
        "
      >
        <Camera size={18} strokeWidth={2} />
        Scanner un autre ticket
      </button>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  accent = false,
  warning = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/40">
      <div
        className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
          accent ? 'bg-brand/15' : warning ? 'bg-title/15' : 'bg-foreground/5'
        }`}
      >
        <Icon
          size={14}
          strokeWidth={2}
          className={
            accent ? 'text-brand' : warning ? 'text-title' : 'text-muted'
          }
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-muted uppercase tracking-[0.08em] mb-0.5">
          {label}
        </p>
        <p
          className={`text-sm font-semibold truncate ${accent ? 'text-brand' : 'text-foreground'}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Camera Viewfinder ────────────────────────────────────────────────────────

function CameraViewfinder({
  isScanning,
  loading,
  error,
  videoRef,
}: {
  isScanning: boolean;
  loading: boolean;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative rounded-3xl overflow-hidden bg-surface border border-foreground/8 aspect-square shadow-xl">
        {/* Video stream */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
        />

        {/* Scan overlay */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Dimmed corners */}
            <div className="absolute inset-0 bg-background/30" />

            {/* Viewfinder box */}
            <div className="relative w-52 h-52 z-10">
              {/* Corner brackets */}
              <span className="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] border-brand rounded-tl-lg" />
              <span className="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] border-brand rounded-tr-lg" />
              <span className="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] border-brand rounded-bl-lg" />
              <span className="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] border-brand rounded-br-lg" />

              {/* Scan line */}
              <div
                className="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-brand to-transparent rounded-full shadow-[0_0_8px_rgba(13,148,136,0.9)]"
                style={{ animation: 'scanline 2s ease-in-out infinite' }}
              />

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-3 rounded-2xl bg-brand/10 backdrop-blur-sm">
                  <ScanLine
                    size={32}
                    className="text-brand opacity-60"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Idle state */}
        {!isScanning && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/90 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-foreground/5 flex items-center justify-center">
              <CameraOff size={28} className="text-muted" strokeWidth={1.5} />
            </div>
            <p className="text-muted text-sm">Caméra inactive</p>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm gap-3 z-20">
            <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
              <Loader2
                size={28}
                className="text-brand animate-spin"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-sm text-muted font-medium">
              Vérification en cours...
            </p>
          </div>
        )}

        {/* Scan line keyframes */}
        <style>{`
          @keyframes scanline {
            0% { top: 6px; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: calc(100% - 6px); opacity: 0; }
          }
        `}</style>
      </div>

      {/* Camera error */}
      {error && (
        <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
          <CameraOff size={15} strokeWidth={2} />
          {error}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ScannerPage() {
  const [result, setResult] = useState<HistoriqueTicketDto | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;

  const handleScan = useCallback(async (code: string) => {
    setLoading(true);
    setResult(null);
    try {
      const data = await ticketService.scanTicket(code);
      setResult(data);
    } catch (error) {
      console.error('Erreur lors du scan du ticket:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = () => {
    setResult(null);
    startScanning();
  };

  const { videoRef, startScanning, stopScanning, isScanning, error } =
    useQRScanner(handleScan);

  // Auth guard
  if (!user || !userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={28} className="text-error" strokeWidth={1.5} />
          </div>
          <h2 className="font-title text-xl font-bold text-foreground mb-2">
            Accès non autorisé
          </h2>
          <p className="text-muted text-sm mb-6">
            Connectez-vous pour accéder au scanner de tickets.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-all"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Subtle background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-4 pt-5 pb-4 max-w-lg mx-auto w-full">
        <Link
          href={`/frontend/controler/page/dashboard/${userId}`}
          className="flex items-center gap-1.5 text-muted hover:text-foreground text-sm transition-colors group"
        >
          <ArrowLeft
            size={18}
            strokeWidth={2}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Dashboard
        </Link>
        <div className="text-center">
          <h1 className="font-title font-bold text-foreground text-[17px]">
            Scanner QR
          </h1>
        </div>
        {/* Scan session counter */}
        <div className="flex items-center gap-1.5 text-xs text-muted bg-surface border border-foreground/8 px-3 py-1.5 rounded-full">
          <div
            className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-btn animate-pulse' : 'bg-muted'}`}
          />
          {isScanning ? 'Actif' : 'Inactif'}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 pb-8 max-w-lg mx-auto w-full gap-5">
        {/* Camera zone */}
        {!result && (
          <>
            <CameraViewfinder
              isScanning={isScanning}
              loading={loading}
              error={error}
              videoRef={videoRef}
            />

            {/* Instruction label */}
            <p className="text-muted text-sm text-center -mt-1">
              {isScanning
                ? 'Pointez la caméra vers le QR code du ticket'
                : 'Appuyez sur "Lancer le scan" pour démarrer la caméra'}
            </p>

            {/* Controls */}
            <div className="w-full max-w-sm mx-auto">
              {!isScanning ? (
                <button
                  onClick={startScanning}
                  className="
                    w-full flex items-center justify-center gap-2.5
                    py-4 rounded-2xl
                    bg-btn text-background
                    font-title font-bold text-[15px]
                    shadow-[0_8px_24px_rgba(34,197,94,0.25)]
                    hover:shadow-[0_12px_32px_rgba(34,197,94,0.35)]
                    hover:scale-[1.01] active:scale-[0.99]
                    transition-all duration-200
                  "
                >
                  <Camera size={18} strokeWidth={2} />
                  Lancer le scan
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="
                    w-full flex items-center justify-center gap-2.5
                    py-4 rounded-2xl
                    bg-surface border border-foreground/10
                    text-foreground
                    font-title font-semibold text-[15px]
                    hover:bg-foreground/5
                    hover:scale-[1.01] active:scale-[0.99]
                    transition-all duration-200
                  "
                >
                  <Square size={16} strokeWidth={2} />
                  Arrêter le scan
                </button>
              )}
            </div>

            {/* Refresh hint */}
            {!isScanning && (
              <div className="flex items-center gap-2 text-xs text-muted">
                <RefreshCw size={12} strokeWidth={2} />
                Scanner automatiquement à la détection du QR code
              </div>
            )}
          </>
        )}

        {/* Scan result */}
        {result && <ScanResultCard result={result} onReset={handleReset} />}
      </main>
    </div>
  );
}

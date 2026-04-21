'use client';
import { useEffect, useState, useCallback } from 'react';
import { AdminResponse } from '../../module/domain/entities/admin.repository';
import { AdminRepository } from '../../module/infrastructure/admin.repository';

const dashboardRepo = new AdminRepository();

import { useSyncExternalStore } from 'react';
import ThemeToggle from '@/app/frontend/components/ui/ThemeToggle';

// ── Copie ces 3 fonctions depuis ThemeToggle ──────────────────────────────
function subscribeToTheme(callback: () => void): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', callback);
  window.addEventListener('themechange', callback);
  return () => {
    mediaQuery.removeEventListener('change', callback);
    window.removeEventListener('themechange', callback);
  };
}

function getThemeSnapshot(): boolean {
  const saved = localStorage.getItem('theme');
  if (saved) return saved === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getServerSnapshot(): boolean {
  return false;
}
// ──

// ─── Sub-types ────────────────────────────────────────────────────────────────
type Status = 'idle' | 'loading' | 'success' | 'error';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}k`
      : String(n);
const currency = (n: number) =>
  new Intl.NumberFormat('fr-CI', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(n);

const pct = (n: number) => `${n}%`;
// ─── Design tokens ────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;600;700&display=swap');

  :root {
    --bg:        #ffffff;
    --surface:   #f9fafb;
    --card:      #ffffff;
    --border:    rgba(0,0,0,0.07);
    --border-2:  rgba(0,0,0,0.13);
    --text-1:    #111827;
    --text-2:    #6b7280;
    --text-3:    #9ca3af;
    --accent:    #0d9488;
    --accent-2:  #f97316;
    --green:     #22c55e;
    --amber:     #f97316;
    --radius:    12px;
    --radius-lg: 20px;
  }

  .dark-dashboard {
    --bg:        #030712;
    --surface:   #111827;
    --card:      #111827;
    --border:    rgba(255,255,255,0.07);
    --border-2:  rgba(255,255,255,0.13);
    --text-1:    #f9fafb;
    --text-2:    #9ca3af;
    --text-3:    #6b7280;
    --accent:    #0d9488;
    --accent-2:  #fb923c;
    --green:     #4ade80;
    --amber:     #fb923c;
  }

  .adm-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .adm-root {
    font-family: 'Inter', ui-sans-serif, system-ui;
    background: var(--bg);
    color: var(--text-1);
    min-height: 100vh;
    padding: 32px;
    transition: background 0.3s, color 0.3s;
  }

  /* ── Header ── */
  .adm-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 40px;
  }
  .adm-header-left h1 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
    line-height: 1;
    color: var(--accent-2);
  }
  .adm-header-left p {
    margin-top: 6px;
    font-size: 13px;
    color: var(--text-3);
    font-family: 'Inter', sans-serif;
    font-weight: 400;
  }
  .adm-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid var(--border-2);
    font-size: 11px;
    font-family: 'Inter', sans-serif;
    color: var(--text-2);
    background: var(--surface);
  }
  .adm-badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 6px var(--green);
    animation: adm-pulse 2s ease-in-out infinite;
  }
  @keyframes adm-pulse {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.4; }
  }

  /* ── KPI row ── */
  .adm-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  @media (max-width: 900px) { .adm-kpi-grid { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 500px) { .adm-kpi-grid { grid-template-columns: 1fr; } }

  .adm-kpi {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .adm-kpi:hover {
    border-color: var(--border-2);
    box-shadow: 0 4px 16px rgba(13,148,136,0.08);
  }
  .adm-kpi-glow {
    position: absolute;
    top: -30px; right: -30px;
    width: 100px; height: 100px;
    border-radius: 50%;
    filter: blur(40px);
    opacity: 0.12;
    pointer-events: none;
  }
  .adm-kpi-label {
    font-size: 11px;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    color: var(--text-3);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 12px;
  }
  .adm-kpi-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 34px;
    font-weight: 700;
    letter-spacing: -1px;
    line-height: 1;
  }
  .adm-kpi-sub {
    margin-top: 8px;
    font-size: 12px;
    color: var(--text-2);
    font-family: 'Inter', sans-serif;
  }
  .adm-kpi-delta {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    margin-top: 6px;
    padding: 2px 8px;
    border-radius: 999px;
  }
  .adm-kpi-delta.up   { background: rgba(34,197,94,0.1);  color: var(--green); }
  .adm-kpi-delta.warn { background: rgba(249,115,22,0.1); color: var(--amber); }

  /* ── Main grid ── */
  .adm-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 800px) { .adm-grid { grid-template-columns: 1fr; } }
  .adm-full { grid-column: 1 / -1; }

  /* ── Card ── */
  .adm-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .adm-card:hover {
    border-color: var(--border-2);
    box-shadow: 0 4px 16px rgba(13,148,136,0.07);
  }
  .adm-card-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-2);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .adm-card-title span {
    width: 3px; height: 14px;
    border-radius: 2px;
    display: block;
  }

  /* ── Role bars ── */
  .adm-roles { display: flex; flex-direction: column; gap: 10px; }
  .adm-role-row { display: flex; align-items: center; gap: 10px; }
  .adm-role-name {
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    color: var(--text-2);
    width: 100px;
    flex-shrink: 0;
  }
  .adm-role-bar-bg {
    flex: 1; height: 4px;
    background: var(--border);
    border-radius: 99px;
    overflow: hidden;
  }
  .adm-role-bar {
    height: 100%;
    border-radius: 99px;
    transition: width 0.8s cubic-bezier(.16,1,.3,1);
  }
  .adm-role-count {
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    color: var(--text-1);
    width: 36px;
    text-align: right;
  }

  /* ── Stat list ── */
  .adm-stat-list { display: flex; flex-direction: column; gap: 14px; }
  .adm-stat-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--border);
  }
  .adm-stat-row:last-child { border-bottom: none; padding-bottom: 0; }
  .adm-stat-label { font-size: 13px; color: var(--text-2); }
  .adm-stat-value {
    font-size: 15px;
    font-weight: 700;
    font-family: 'Space Grotesk', sans-serif;
  }

  /* ── Provider list ── */
  .adm-provider-list { display: flex; flex-direction: column; gap: 12px; }
  .adm-provider-row { display: flex; align-items: center; gap: 12px; }
  .adm-provider-icon {
    width: 36px; height: 36px;
    border-radius: 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    color: var(--accent);
    flex-shrink: 0;
  }
  .adm-provider-info { flex: 1; }
  .adm-provider-name { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
  .adm-provider-bar-bg {
    height: 3px;
    background: var(--border);
    border-radius: 99px;
    overflow: hidden;
  }
  .adm-provider-bar {
    height: 100%;
    border-radius: 99px;
    transition: width 0.8s cubic-bezier(.16,1,.3,1);
  }
  .adm-provider-amount {
    font-size: 13px;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600;
    color: var(--text-1);
    flex-shrink: 0;
    text-align: right;
  }

  /* ── Top events ── */
  .adm-events-list { display: flex; flex-direction: column; gap: 10px; }
  .adm-event-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: border-color 0.2s, background 0.2s;
    cursor: default;
  }
  .adm-event-row:hover { border-color: var(--accent); }
  .adm-event-rank {
    font-size: 11px;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    color: var(--accent);
    width: 20px;
    flex-shrink: 0;
  }
  .adm-event-title {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Space Grotesk', sans-serif;
    padding: 0 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .adm-event-date {
    font-size: 11px;
    font-family: 'Inter', sans-serif;
    color: var(--text-3);
    margin-right: 12px;
    flex-shrink: 0;
  }
  .adm-event-tickets {
    font-size: 13px;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600;
    color: var(--accent);
    flex-shrink: 0;
  }

  /* ── Ticket status ── */
  .adm-ticket-status { display: flex; gap: 12px; }
  .adm-ticket-stat {
    flex: 1;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    text-align: center;
  }
  .adm-ticket-stat-val {
    font-size: 24px;
    font-weight: 700;
    font-family: 'Space Grotesk', sans-serif;
    letter-spacing: -0.5px;
  }
  .adm-ticket-stat-label {
    font-size: 11px;
    color: var(--text-3);
    margin-top: 4px;
    font-family: 'Inter', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  /* ── Gauge ── */
  .adm-gauge-wrap { display: flex; align-items: center; gap: 20px; margin-top: 16px; }
  .adm-gauge-svg { flex-shrink: 0; }
  .adm-gauge-info h3 {
    font-size: 22px;
    font-weight: 700;
    font-family: 'Space Grotesk', sans-serif;
    color: var(--accent);
  }
  .adm-gauge-info p { font-size: 12px; color: var(--text-3); margin-top: 2px; }

  /* ── Skeleton ── */
  .adm-skeleton {
    background: linear-gradient(90deg, var(--card) 25%, var(--surface) 50%, var(--card) 75%);
    background-size: 200% 100%;
    animation: adm-shimmer 1.4s ease-in-out infinite;
    border-radius: var(--radius);
  }
  @keyframes adm-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Error state ── */
  .adm-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    gap: 12px;
    color: var(--text-3);
    font-family: 'Inter', sans-serif;
    font-size: 13px;
  }
  .adm-error-icon { font-size: 32px; opacity: 0.4; }

  /* ── Notifications ── */
  .adm-notif-list { display: flex; flex-direction: column; gap: 8px; }
  .adm-notif-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: var(--surface);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    transition: border-color 0.2s;
  }
  .adm-notif-row:hover { border-color: var(--accent); }
  .adm-notif-type {
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    color: var(--text-2);
    text-transform: capitalize;
  }
  .adm-notif-count {
    font-size: 13px;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600;
    color: var(--accent);
  }

  /* ── Fade in ── */
  @keyframes adm-fade-up {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .adm-fade { animation: adm-fade-up 0.4s ease both; }
  .adm-fade-1 { animation-delay: 0.05s; }
  .adm-fade-2 { animation-delay: 0.10s; }
  .adm-fade-3 { animation-delay: 0.15s; }
  .adm-fade-4 { animation-delay: 0.20s; }
`;
// ─── Gauge SVG ────────────────────────────────────────────────────────────────
function Gauge({ value, color }: { value: number; color: string }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const half = circ / 2;
  const offset = half - (value / 100) * half;

  return (
    <svg className="adm-gauge-svg" width="100" height="56" viewBox="0 0 100 56">
      <path
        d={`M 10 50 A ${r} ${r} 0 0 1 90 50`}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d={`M 10 50 A ${r} ${r} 0 0 1 90 50`}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${half} ${half}`}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)' }}
      />
    </svg>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonDashboard() {
  return (
    <div className="adm-root">
      <div className="adm-header">
        <div>
          <div
            className="adm-skeleton"
            style={{ width: 200, height: 28, marginBottom: 8 }}
          />
          <div className="adm-skeleton" style={{ width: 280, height: 14 }} />
        </div>
      </div>
      <div className="adm-kpi-grid">
        {[...Array(4)].map((_, i) => (
          <div
            className="adm-skeleton"
            key={i}
            style={{ height: 110, borderRadius: 20 }}
          />
        ))}
      </div>
      <div className="adm-grid">
        {[...Array(4)].map((_, i) => (
          <div
            className="adm-skeleton"
            key={i}
            style={{ height: 220, borderRadius: 20 }}
          />
        ))}
      </div>
    </div>
  );
}
// ─── Role colors ──────────────────────────────────────────────────────────────
const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#6c63ff',
  ORGANIZER: '#36d399',
  PARTICIPANT: '#fbbd23',
  CONTROLLER: '#ff6b6b',
};

const PROVIDER_COLORS = ['#6c63ff', '#36d399', '#fbbd23', '#ff6b6b', '#38bdf8'];

const STATUS_COLORS: Record<string, string> = {
  VALID: '#36d399',
  USED: '#6c63ff',
  CANCELLED: '#ff6b6b',
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [data, setData] = useState<AdminResponse | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerSnapshot,
  );

  const fetchData = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await dashboardRepo.getDashboardStats();
      setData(result);
      setLastSync(new Date());
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setStatus('loading');
      try {
        const result = await dashboardRepo.getDashboardStats();
        if (!cancelled) {
          setData(result);
          setLastSync(new Date());
          setStatus('success');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    load();

    return () => {
      cancelled = true; // évite les setState sur composant démonté
    };
  }, []);
  if (status === 'idle' || status === 'loading') return <SkeletonDashboard />;

  if (status === 'error') {
    return (
      <div className="adm-root">
        <style>{styles}</style>
        <div className="adm-error">
          <div className="adm-error-icon">⚠</div>
          <p>Impossible de charger les statistiques</p>
          <button
            onClick={fetchData}
            style={{
              marginTop: 8,
              padding: '8px 20px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: 'var(--text-1)',
              cursor: 'pointer',
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
            }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { users, events, tickets, payments, lottery, notifications } = data;
  const maxProviderAmount = Math.max(
    ...payments.byProvider.map((p) => p.amount),
    1,
  );
  const maxRoleCount = Math.max(...users.byRole.map((r) => r.count), 1);
  const totalTickets = tickets.byStatus.reduce((s, t) => s + t.count, 0);

  return (
    <div className={`adm-root ${isDark ? 'dark-dashboard' : ''}`}>
      <div className="adm-theme-toggle absolute top-4 right-10 p-1.5 mr-3">
        <ThemeToggle />
      </div>
      <style>{styles}</style>
      <div className="adm-root">
        {/* ── Header ── */}
        <div className="adm-header adm-fade">
          <div className="adm-header-left">
            <h1 className="adm-header-title font-title text-3xl">
              Analyse des données événementielles
            </h1>
            <p>
              {lastSync
                ? `Mis à jour à ${lastSync.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                : 'Chargement…'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="adm-badge">
              <span className="adm-badge-dot" />
              live
            </div>
            <button
              onClick={fetchData}
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(108,99,255,0.12)',
                color: '#6c63ff',
                cursor: 'pointer',
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              Actualiser
            </button>
          </div>
        </div>
        {/* ── KPI row ── */}
        <div className="adm-kpi-grid">
          {/* Revenus totaux */}
          <div className="adm-kpi adm-fade adm-fade-1">
            <div className="adm-kpi-glow" style={{ background: '#6c63ff' }} />
            <div className="adm-kpi-label">Revenus totaux</div>
            <div className="adm-kpi-value" style={{ color: '#6c63ff' }}>
              {currency(payments.totalRevenue)}
            </div>
            <div className="adm-kpi-sub">
              +{currency(payments.revenueLast7Days)} cette semaine
            </div>
          </div>

          {/* Utilisateurs */}
          <div className="adm-kpi adm-fade adm-fade-2">
            <div className="adm-kpi-glow" style={{ background: '#36d399' }} />
            <div className="adm-kpi-label">Utilisateurs</div>
            <div className="adm-kpi-value" style={{ color: '#36d399' }}>
              {fmt(users.total)}
            </div>
            <span className="adm-kpi-delta up">
              +{users?.newLast7Days ?? 0}/ 7j
            </span>
          </div>
          {/* Tickets */}
          <div className="adm-kpi adm-fade adm-fade-3">
            <div className="adm-kpi-glow" style={{ background: '#fbbd23' }} />
            <div className="adm-kpi-label">Tickets émis</div>
            <div className="adm-kpi-value" style={{ color: '#fbbd23' }}>
              {fmt(totalTickets)}
            </div>
            <span className="adm-kpi-delta warn">
              {pct(tickets.scanRate)} scannés
            </span>
          </div>

          {/* Événements */}
          <div className="adm-kpi adm-fade adm-fade-4">
            <div className="adm-kpi-glow" style={{ background: '#ff6b6b' }} />
            <div className="adm-kpi-label">Événements</div>
            <div className="adm-kpi-value" style={{ color: '#ff6b6b' }}>
              {events.total}
            </div>
            <div className="adm-kpi-sub">
              {events.active} actifs · {events.upcoming} à venir
            </div>
          </div>
        </div>
        {/* ── Main grid ── */}
        <div className="adm-grid">
          {/* Utilisateurs par rôle */}
          <div className="adm-card adm-fade adm-fade-1">
            <div className="adm-card-title">
              <span style={{ background: '#6c63ff' }} />
              Répartition des rôles
            </div>
            <div className="adm-roles">
              {users.byRole.map((r) => (
                <div className="adm-role-row" key={r.role}>
                  <div className="adm-role-name">{r.role}</div>
                  <div className="adm-role-bar-bg">
                    <div
                      className="adm-role-bar"
                      style={{
                        width: `${(r.count / maxRoleCount) * 100}%`,
                        background: ROLE_COLORS[r.role] ?? '#888',
                      }}
                    />
                  </div>
                  <div className="adm-role-count">{r.count}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 16 }}>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: 'DM Mono, monospace',
                    color: 'var(--text-3)',
                  }}
                >
                  Nouveaux (30j)
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    fontFamily: 'DM Mono, monospace',
                    marginTop: 2,
                  }}
                >
                  +{users.newLast30Days}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: 'DM Mono, monospace',
                    color: 'var(--text-3)',
                  }}
                >
                  Avec téléphone
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    fontFamily: 'DM Mono, monospace',
                    marginTop: 2,
                  }}
                >
                  {fmt(users.withPhone)}
                </div>
              </div>
            </div>
          </div>
          {/* Paiements par provider */}
          <div className="adm-card adm-fade adm-fade-2">
            <div className="adm-card-title">
              <span style={{ background: '#36d399' }} />
              Paiements par opérateur
            </div>
            <div className="adm-provider-list">
              {payments.byProvider.map((p, i) => (
                <div className="adm-provider-row" key={p.provider}>
                  <div className="adm-provider-icon">
                    {p.provider.slice(0, 3)}
                  </div>
                  <div className="adm-provider-info">
                    <div className="adm-provider-name">{p.provider}</div>
                    <div className="adm-provider-bar-bg">
                      <div
                        className="adm-provider-bar"
                        style={{
                          width: `${(p.amount / maxProviderAmount) * 100}%`,
                          background:
                            PROVIDER_COLORS[i % PROVIDER_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                  <div className="adm-provider-amount">{fmt(p.amount)}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: 'DM Mono, monospace',
                  color: 'var(--text-3)',
                  marginBottom: 4,
                }}
              >
                Ce mois
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  fontFamily: 'DM Mono, monospace',
                }}
              >
                {currency(payments.revenueLastMonth)}
              </div>
            </div>
          </div>
          {/* Statut des tickets */}
          <div className="adm-card adm-fade adm-fade-3">
            <div className="adm-card-title">
              <span style={{ background: '#fbbd23' }} />
              Statut des tickets
            </div>
            <div className="adm-ticket-status">
              {tickets.byStatus.map((s) => (
                <div className="adm-ticket-stat" key={s.status}>
                  <div
                    className="adm-ticket-stat-val"
                    style={{ color: STATUS_COLORS[s.status] ?? '#888' }}
                  >
                    {s.count}
                  </div>
                  <div className="adm-ticket-stat-label">{s.status}</div>
                </div>
              ))}
            </div>
            <div className="adm-gauge-wrap" style={{ marginTop: 24 }}>
              <Gauge value={tickets.scanRate} color="#fbbd23" />
              <div className="adm-gauge-info">
                <h3>{pct(tickets.scanRate)}</h3>
                <p>taux de scan</p>
              </div>
            </div>
          </div>
          {/* Tombola */}
          <div className="adm-card adm-fade adm-fade-4">
            <div className="adm-card-title">
              <span style={{ background: '#ff6b6b' }} />
              Tombola
            </div>
            <div className="adm-stat-list">
              <div className="adm-stat-row">
                <span className="adm-stat-label">Loteries actives</span>
                <span className="adm-stat-value" style={{ color: '#36d399' }}>
                  {lottery.active} / {lottery.total}
                </span>
              </div>
              <div className="adm-stat-row">
                <span className="adm-stat-label">Participations</span>
                <span className="adm-stat-value">
                  {fmt(lottery.totalEntries)}
                </span>
              </div>
              <div className="adm-stat-row">
                <span className="adm-stat-label">Tirages effectués</span>
                <span className="adm-stat-value">{lottery.totalDraws}</span>
              </div>
              <div className="adm-stat-row">
                <span className="adm-stat-label">Lots attribués</span>
                <span className="adm-stat-value" style={{ color: '#fbbd23' }}>
                  {lottery.prizesAwarded}
                </span>
              </div>
            </div>
          </div>
          {/* Top événements — full width */}
          <div className="adm-card adm-full adm-fade adm-fade-2">
            <div className="adm-card-title">
              <span style={{ background: '#38bdf8' }} />
              Top 5 événements
            </div>
            <div className="adm-events-list">
              {events.topEvents.map((e, i) => (
                <div className="adm-event-row" key={e.id}>
                  <span className="adm-event-rank">#{i + 1}</span>
                  <span className="adm-event-title">{e.title}</span>
                  <span className="adm-event-date">
                    {new Date(e.date).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="adm-event-tickets">
                    {e.ticketCount} tickets
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Notifications */}
          <div className="adm-card adm-fade adm-fade-3">
            <div className="adm-card-title">
              <span style={{ background: '#a78bfa' }} />
              Notifications
            </div>
            <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: 'DM Mono, monospace',
                    color: 'var(--text-3)',
                  }}
                >
                  Total
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    fontFamily: 'DM Mono, monospace',
                  }}
                >
                  {fmt(notifications.total)}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: 'DM Mono, monospace',
                    color: 'var(--text-3)',
                  }}
                >
                  Non lues
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    fontFamily: 'DM Mono, monospace',
                    color: '#ff6b6b',
                  }}
                >
                  {notifications.unread}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: 'DM Mono, monospace',
                    color: 'var(--text-3)',
                  }}
                >
                  Taux de lecture
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    fontFamily: 'DM Mono, monospace',
                    color: '#36d399',
                  }}
                >
                  {pct(notifications.readRate)}
                </div>
              </div>
            </div>
            <div className="adm-notif-list">
              {notifications.byType.slice(0, 4).map((n) => (
                <div className="adm-notif-row" key={n.type}>
                  <span className="adm-notif-type">
                    {n.type.replace(/_/g, ' ')}
                  </span>
                  <span className="adm-notif-count">{n.count}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Paiements par statut */}
          <div className="adm-card adm-fade adm-fade-4">
            <div className="adm-card-title">
              <span style={{ background: '#fbbd23' }} />
              Paiements — statuts
            </div>
            <div className="adm-stat-list">
              {payments.byStatus.map((s) => (
                <div className="adm-stat-row" key={s.status}>
                  <span className="adm-stat-label">{s.status}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      className="adm-stat-value"
                      style={{
                        color:
                          s.status === 'SUCCESS'
                            ? '#36d399'
                            : s.status === 'PENDING'
                              ? '#fbbd23'
                              : '#ff6b6b',
                      }}
                    >
                      {s.count}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: 'DM Mono, monospace',
                        color: 'var(--text-3)',
                        marginTop: 2,
                      }}
                    >
                      {currency(s.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

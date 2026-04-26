'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Chart,
  BarController,
  DoughnutController,
  LineController,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
} from 'chart.js';
import Image from 'next/image';
import { Calendar, Ticket } from 'lucide-react';

Chart.register(
  BarController,
  DoughnutController,
  LineController,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardData {
  users: {
    total: number;
    byRole: { role: string; count: number }[];
    newLast7Days: number;
    newLast30Days: number;
    withPhone: number;
  };
  events: {
    total: number;
    active: number;
    past: number;
    upcoming: number;
    topEvents: {
      id: string;
      title: string;
      date: string;
      ticketCount: number;
    }[];
  };
  tickets: {
    total: number;
    byStatus: { status: string; count: number }[];
    scanRate: number;
  };
  payments: {
    totalRevenue: number;
    revenueLast7Days: number;
    revenueLastMonth: number;
    byStatus: { status: string; count: number; amount: number }[];
    byProvider: unknown[];
  };
  lottery: {
    total: number;
    active: number;
    totalEntries: number;
    totalDraws: number;
    prizesAwarded: number;
  };
  notifications: {
    total: number;
    unread: number;
    readRate: number;
    byType: unknown[];
  };
  generatedAt: string;
}

// ─── Animated counter hook ────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const timeout = setTimeout(() => {
      const step = (ts: number) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(ease * target));
        if (progress < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);
  return value;
}

// ─── Intersection observer hook ───────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  accent,
  icon,
  delay = 0,
}: {
  label: string;
  value: number;
  sub?: string;
  accent: string;
  icon: React.ReactNode;
  delay?: number;
}) {
  const count = useCountUp(value, 1400, delay);
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* accent glow top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: accent,
          borderRadius: '16px 16px 0 0',
        }}
      />
      {/* subtle bg glow */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: accent,
          opacity: 0.06,
          filter: 'blur(24px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
      <div
        style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.45)',
          marginBottom: 6,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {count.toLocaleString('fr-FR')}
      </div>
      {sub && (
        <div
          style={{ fontSize: 12, color: accent, marginTop: 6, fontWeight: 500 }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.3)',
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

// ─── Chart wrapper card ───────────────────────────────────────────────────────

function Card({
  title,
  sub,
  legend,
  children,
  delay = 0,
}: {
  title: string;
  sub?: string;
  legend?: { color: string; label: string }[];
  children: React.ReactNode;
  delay?: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: '20px 22px',
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          {title}
        </div>
        {sub && (
          <div
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.35)',
              marginTop: 2,
            }}
          >
            {sub}
          </div>
        )}
      </div>
      {legend && legend.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 14,
          }}
        >
          {legend.map((l) => (
            <span
              key={l.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: l.color,
                  display: 'inline-block',
                }}
              />
              {l.label}
            </span>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Chart.js shared plugin: animate bars on draw ────────────────────────────

const CHART_DEFAULTS = {
  animation: { duration: 900, easing: 'easeOutQuart' as const },
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
};

const GRID = { color: 'rgba(255,255,255,0.05)', drawBorder: false };
const TICK = {
  color: 'rgba(255,255,255,0.35)',
  font: { size: 11, family: "'DM Mono', monospace" },
};

// ─── Roles bar chart ──────────────────────────────────────────────────────────

function RolesChart({
  data,
  visible,
}: {
  data: DashboardData['users']['byRole'];
  visible: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!visible || !canvasRef.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: data.map((d) => d.role),
        datasets: [
          {
            data: data.map((d) => d.count),
            backgroundColor: [
              'rgba(99,179,237,0.85)',
              'rgba(99,179,237,0.55)',
              'rgba(99,179,237,0.3)',
            ],
            borderColor: [
              '#63B3ED',
              'rgba(99,179,237,0.7)',
              'rgba(99,179,237,0.4)',
            ],
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        ...CHART_DEFAULTS,
        scales: {
          x: { ticks: TICK, grid: { display: false } },
          y: {
            ticks: { ...TICK, stepSize: 1 },
            grid: GRID,
            min: 0,
            border: { display: false },
          },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [data, visible]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 180 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

// ─── Tickets doughnut ─────────────────────────────────────────────────────────

function TicketsDoughnut({
  data,
  total,
  visible,
}: {
  data: DashboardData['tickets']['byStatus'];
  total: number;
  visible: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!visible || !canvasRef.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: data.map((d) => d.status),
        datasets: [
          {
            data: data.map((d) => d.count),
            backgroundColor: ['rgba(72,187,120,0.85)', 'rgba(72,187,120,0.3)'],
            borderColor: ['#48BB78', 'rgba(72,187,120,0.5)'],
            borderWidth: 1,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        ...CHART_DEFAULTS,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) =>
                ` ${c.label}: ${c.parsed} (${Math.round((c.parsed / total) * 100)}%)`,
            },
          },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [data, total, visible]);

  const valid = data.find((d) => d.status === 'VALID')?.count ?? 0;
  const pct = Math.round((valid / total) * 100);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 180,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
      {/* center label */}
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#48BB78',
            lineHeight: 1,
          }}
        >
          {pct}%
        </div>
        <div
          style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}
        >
          valides
        </div>
      </div>
    </div>
  );
}

// ─── Top events horizontal bars ───────────────────────────────────────────────

function TopEventsChart({
  events,
  visible,
}: {
  events: DashboardData['events']['topEvents'];
  visible: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!visible || !canvasRef.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: events.map((e) =>
          e.title.length > 22 ? e.title.slice(0, 20) + '…' : e.title,
        ),
        datasets: [
          {
            data: events.map((e) => e.ticketCount),
            backgroundColor: events.map(
              (_, i) => `rgba(246,173,85,${0.9 - i * 0.25})`,
            ),
            borderColor: events.map(
              (_, i) => `rgba(246,173,85,${1 - i * 0.2})`,
            ),
            borderWidth: 1,
            borderRadius: 5,
            borderSkipped: false,
          },
        ],
      },
      options: {
        ...CHART_DEFAULTS,
        indexAxis: 'y',
        scales: {
          x: {
            ticks: { ...TICK, stepSize: 5 },
            grid: GRID,
            min: 0,
            border: { display: false },
          },
          y: { ticks: { ...TICK, autoSkip: false }, grid: { display: false } },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [events, visible]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: events.length * 56 + 32,
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

// ─── Payments dual-axis bar ───────────────────────────────────────────────────

function PaymentsChart({
  data,
  visible,
}: {
  data: DashboardData['payments']['byStatus'];
  visible: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!visible || !canvasRef.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: data.map((d) => d.status),
        datasets: [
          {
            label: 'Transactions',
            data: data.map((d) => d.count),
            backgroundColor: 'rgba(237,137,54,0.8)',
            borderColor: '#ED8936',
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
            yAxisID: 'y',
          },
          {
            label: 'Montant',
            data: data.map((d) => d.amount),
            backgroundColor: 'rgba(237,137,54,0.25)',
            borderColor: 'rgba(237,137,54,0.5)',
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
            yAxisID: 'y2',
          },
        ],
      },
      options: {
        ...CHART_DEFAULTS,
        scales: {
          x: { ticks: TICK, grid: { display: false } },
          y: {
            position: 'left',
            ticks: TICK,
            grid: GRID,
            border: { display: false },
            title: {
              display: true,
              text: 'Nb tx',
              color: 'rgba(255,255,255,0.3)',
              font: { size: 10 },
            },
          },
          y2: {
            position: 'right',
            ticks: { ...TICK, callback: (v) => `${Number(v) / 1000}k` },
            grid: { display: false },
            border: { display: false },
            title: {
              display: true,
              text: 'FCFA',
              color: 'rgba(255,255,255,0.3)',
              font: { size: 10 },
            },
          },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [data, visible]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 180 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

// ─── Lottery bar chart ────────────────────────────────────────────────────────

function LotteryChart({
  lottery,
  visible,
}: {
  lottery: DashboardData['lottery'];
  visible: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!visible || !canvasRef.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: ['Participations', 'Tirages', 'Prix'],
        datasets: [
          {
            data: [
              lottery.totalEntries,
              lottery.totalDraws,
              lottery.prizesAwarded,
            ],
            backgroundColor: [
              'rgba(159,122,234,0.85)',
              'rgba(159,122,234,0.55)',
              'rgba(159,122,234,0.3)',
            ],
            borderColor: [
              '#9F7AEA',
              'rgba(159,122,234,0.7)',
              'rgba(159,122,234,0.4)',
            ],
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        ...CHART_DEFAULTS,
        scales: {
          x: { ticks: TICK, grid: { display: false } },
          y: { ticks: TICK, grid: GRID, border: { display: false }, min: 0 },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [lottery, visible]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 160 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

// ─── Scan rate progress bar ───────────────────────────────────────────────────

function ScanRateBar({ rate, visible }: { rate: number; visible: boolean }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
          Taux de scan global
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#48BB78' }}>
          {rate}%
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 99,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: visible ? `${rate}%` : '0%',
            background: 'linear-gradient(90deg, #48BB78, #68D391)',
            borderRadius: 99,
            transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1) 300ms',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 6,
        }}
      >
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
          0%
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
          100%
        </span>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function AdminDashboardGraph({ data }: { data: DashboardData }) {
  const { users, events, tickets, payments, lottery } = data;
  const { ref: chartsRef, inView: chartsVisible } = useInView(0.05);

  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(data.generatedAt));

  return (
    <div
      className="bg-background"
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        // background: 'transparent',
        color: '#fff',
        padding: '28px 24px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          marginBottom: 32,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            Administration
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              margin: 0,
              color: '#fff',
              lineHeight: 1.1,
            }}
          >
            Vue analytique
          </h1>
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 8,
            padding: '6px 12px',
          }}
        >
          Sync · {formattedDate}
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginBottom: 32,
        }}
      >
        <KpiCard
          label="Utilisateurs"
          value={users.total}
          sub={`↑ ${users.newLast7Days} cette semaine`}
          accent="#63B3ED"
          icon={
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand/50">
              <Image
                src="/images/icon_profile.jpg"
                width={40}
                height={40}
                alt="Logo"
                className="object-cover"
              />
            </div>
          }
          delay={0}
        />
        <KpiCard
          label="Billets émis"
          value={tickets.total}
          sub={`Scan rate ${tickets.scanRate}%`}
          accent="#48BB78"
          icon={<Ticket />}
          delay={80}
        />
        <KpiCard
          label="Événements"
          value={events.total}
          sub={`${events.upcoming} à venir`}
          accent="#F6AD55"
          icon={<Calendar />}
        />
        <KpiCard
          label="Loterie — entrées"
          value={lottery.totalEntries}
          sub={`${lottery.prizesAwarded} prix attribué(s)`}
          accent="#9F7AEA"
          icon={
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand/50">
              <Image
                src="/images/icon_lottery.jpg"
                width={40}
                height={40}
                alt="Logo"
                className="object-cover"
              />
            </div>
          }
          delay={240}
        />
      </div>

      {/* ── Charts ── */}
      <div ref={chartsRef}>
        <SectionLabel>Utilisateurs & billets</SectionLabel>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
            marginBottom: 14,
          }}
        >
          <Card
            title="Répartition des rôles"
            sub={`${users.total} comptes actifs`}
            legend={users.byRole.map((r, i) => ({
              color:
                ['#63B3ED', 'rgba(99,179,237,0.6)', 'rgba(99,179,237,0.35)'][
                  i
                ] ?? '#888',
              label: `${r.role} · ${r.count}`,
            }))}
            delay={0}
          >
            <RolesChart data={users.byRole} visible={chartsVisible} />
          </Card>

          <Card
            title="Statut des billets"
            sub={`${tickets.total} billets au total`}
            legend={tickets.byStatus.map((s, i) => ({
              color: ['#48BB78', 'rgba(72,187,120,0.4)'][i] ?? '#888',
              label: `${s.status} · ${s.count}`,
            }))}
            delay={80}
          >
            <TicketsDoughnut
              data={tickets.byStatus}
              total={tickets.total}
              visible={chartsVisible}
            />
            <ScanRateBar rate={tickets.scanRate} visible={chartsVisible} />
          </Card>
        </div>

        <SectionLabel>Événements & paiements</SectionLabel>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
            marginBottom: 14,
          }}
        >
          <Card
            title="Billets par événement"
            sub="Top événements"
            legend={[{ color: '#F6AD55', label: 'Billets vendus' }]}
            delay={0}
          >
            <TopEventsChart events={events.topEvents} visible={chartsVisible} />
          </Card>

          <Card
            title="Paiements"
            sub="Montant & transactions par statut"
            legend={[
              { color: '#ED8936', label: 'Transactions' },
              { color: 'rgba(237,137,54,0.4)', label: 'Montant (FCFA)' },
            ]}
            delay={80}
          >
            <PaymentsChart data={payments.byStatus} visible={chartsVisible} />
            {/* pending amount highlight */}
            {payments.byStatus[0] && (
              <div
                style={{
                  marginTop: 12,
                  padding: '10px 14px',
                  background: 'rgba(237,137,54,0.08)',
                  border: '1px solid rgba(237,137,54,0.2)',
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                  Montant en attente
                </span>
                <span
                  style={{ fontSize: 15, fontWeight: 700, color: '#F6AD55' }}
                >
                  {payments.byStatus[0].amount.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            )}
          </Card>
        </div>

        <SectionLabel>Loterie</SectionLabel>
        <Card
          title="Vue d'ensemble — Loterie"
          sub={`${lottery.active} loteries actives · ${lottery.total} au total`}
          legend={[
            {
              color: '#9F7AEA',
              label: `Participations · ${lottery.totalEntries}`,
            },
            {
              color: 'rgba(159,122,234,0.55)',
              label: `Tirages · ${lottery.totalDraws}`,
            },
            {
              color: 'rgba(159,122,234,0.3)',
              label: `Prix · ${lottery.prizesAwarded}`,
            },
          ]}
          delay={0}
        >
          <LotteryChart lottery={lottery} visible={chartsVisible} />

          {/* ratio pill row */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 14,
              flexWrap: 'wrap',
            }}
          >
            {[
              {
                label: 'Entrées / loterie',
                value: (
                  lottery.totalEntries / Math.max(lottery.total, 1)
                ).toFixed(1),
                color: '#9F7AEA',
              },
              {
                label: 'Taux de gain',
                value: `${Math.round((lottery.prizesAwarded / Math.max(lottery.totalDraws, 1)) * 100)}%`,
                color: '#68D391',
              },
              {
                label: 'Tirages actifs',
                value: lottery.totalDraws,
                color: '#63B3ED',
              },
            ].map((pill) => (
              <div
                key={pill.label}
                style={{
                  flex: 1,
                  minWidth: 100,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10,
                  padding: '10px 14px',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.35)',
                    marginBottom: 4,
                  }}
                >
                  {pill.label}
                </div>
                <div
                  style={{ fontSize: 20, fontWeight: 700, color: pill.color }}
                >
                  {pill.value}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

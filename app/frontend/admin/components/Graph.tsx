'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
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
  ScriptableContext,
} from 'chart.js';
import { Calendar, Ticket, Users, TrendingUp } from 'lucide-react';

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

// --- Types ---
export interface DashboardData {
  users: {
    total: number;
    byRole: { role: string; count: number }[];
    newLast30Days: number;
  };
  events: {
    total: number;
    active: number;
    topEvents: { id: string; title: string; ticketCount: number }[];
  };
  tickets: {
    total: number;
    byStatus: { status: string; count: number }[];
    scanRate: number;
  };
  payments: {
    totalRevenue: number;
    dailyRevenue: number[];
    revenueLast7Days: number;
    byStatus: { status: string; count: number; amount: number }[];
  };
  lottery: {
    totalEntries: number;
    prizesAwarded: number;
  };
  generatedAt: string;
}

// --- Props Types ---
interface KpiCardProps {
  label: string;
  value: number;
  sub?: string;
  accent: string;
  icon: ReactNode;
  delay?: number;
}

interface CardProps {
  title: string;
  sub?: string;
  legend?: { color: string; label: string }[];
  children: ReactNode;
  delay?: number;
}

const GRID_CONFIG = { color: 'rgba(0,0,0,0.05)', drawBorder: false };
const TICK_CONFIG = {
  color: '#64748b',
  font: { size: 10, family: 'sans-serif', weight: 500 },
} satisfies import('chart.js').TickOptions['font'] extends infer F
  ? { color: string; font: F }
  : never;

// --- Hooks ---
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

function useInView(threshold = 0.1) {
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

// --- Sous-Composants ---

function KpiCard({ label, value, sub, accent, icon, delay = 0 }: KpiCardProps) {
  const count = useCountUp(value, 1400, delay);
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className="bg-surface border border-muted/10 rounded-2xl p-6 relative overflow-hidden transition-all duration-700 shadow-sm"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: accent }}
      />
      <div className="flex justify-between items-start mb-4">
        <div
          className="p-2 rounded-lg bg-background border border-muted/5 shadow-sm"
          style={{ color: accent }}
        >
          {icon}
        </div>
      </div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1">
        {label}
      </div>
      <div className="text-3xl font-black text-title leading-none tabular-nums">
        {count.toLocaleString('fr-FR')}
      </div>
      {sub && (
        <div className="text-xs font-semibold mt-2" style={{ color: accent }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function Card({ title, sub, legend, children, delay = 0 }: CardProps) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className="bg-surface border border-muted/10 rounded-2xl p-6 transition-all duration-700 shadow-sm"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="mb-6">
        <div className="text-lg font-bold text-title">{title}</div>
        {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
      </div>
      {legend && (
        <div className="flex flex-wrap gap-4 mb-6">
          {legend.map((l) => (
            <span
              key={l.label}
              className="flex items-center gap-2 text-xs font-medium text-muted"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: l.color }}
              />
              {l.label}
            </span>
          ))}
        </div>
      )}
      <div className="w-full">{children}</div>
    </div>
  );
}

// --- Graphiques Typés ---

function RevenueLineChart({
  data,
  visible,
}: {
  data: number[];
  visible: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!visible || !canvasRef.current || data.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [
          {
            label: 'Revenus',
            data: data,
            borderColor: '#10b981',
            borderWidth: 3,
            pointRadius: 2,
            fill: true,
            tension: 0.4,
            backgroundColor: (context: ScriptableContext<'line'>) => {
              const gradient = ctx.createLinearGradient(0, 0, 0, 200);
              gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
              gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
              return gradient;
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, ticks: TICK_CONFIG },
          y: {
            beginAtZero: true,
            grid: GRID_CONFIG,
            ticks: TICK_CONFIG,
          },
        },
      },
    });
    return () => chart.destroy();
  }, [data, visible]);

  return (
    <div className="h-64">
      <canvas ref={canvasRef} />
    </div>
  );
}

interface RoleStat {
  role: string;
  count: number;
}

interface RolesChartProps {
  data: RoleStat[];
  visible: boolean;
}

function RolesChart({ data, visible }: RolesChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!visible || !canvasRef.current) return;
    const chart = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: data.map((d) => d.role),
        datasets: [
          {
            data: data.map((d) => d.count),
            backgroundColor: '#3b82f6',
            borderRadius: 8,
            barThickness: 30,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: TICK_CONFIG },
          y: { grid: GRID_CONFIG, ticks: { ...TICK_CONFIG, stepSize: 1 } },
        },
      },
    });
    return () => chart.destroy();
  }, [data, visible]);

  return (
    <div className="h-64">
      <canvas ref={canvasRef} />
    </div>
  );
}

interface TicketStat {
  status: string;
  count: number;
}

interface TicketsDoughnutProps {
  data: TicketStat[];
  total: number;
  visible: boolean;
}

function TicketsDoughnut({ data, total, visible }: TicketsDoughnutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!visible || !canvasRef.current) return;
    const chart = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: data.map((d) => d.status),
        datasets: [
          {
            data: data.map((d) => d.count),
            backgroundColor: ['#10b981', '#e2e8f0'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        cutout: '75%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });
    return () => chart.destroy();
  }, [data, visible]);

  const valid = data.find((d) => d.status === 'VALID')?.count ?? 0;

  return (
    <div className="h-64 relative flex items-center justify-center">
      <canvas ref={canvasRef} />
      <div className="absolute text-center">
        <div className="text-3xl font-black text-emerald-500">
          {total > 0 ? Math.round((valid / total) * 100) : 0}%
        </div>
        <div className="text-[10px] uppercase font-bold text-muted">
          Valides
        </div>
      </div>
    </div>
  );
}

// --- TOP EVENTS BAR CHART (nouveau) ---

interface TopEvent {
  id: string;
  title: string;
  ticketCount: number;
}

interface TopEventsBarChartProps {
  data: TopEvent[];
  visible: boolean;
}

function TopEventsBarChart({ data, visible }: TopEventsBarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!visible || !canvasRef.current || data.length === 0) return;

    const maxTickets = Math.max(...data.map((e) => e.ticketCount));
    const capacity = Math.round(maxTickets * 1.35);

    const chart = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: data.map((e) =>
          e.title.length > 24 ? e.title.slice(0, 24) + '…' : e.title,
        ),
        datasets: [
          {
            label: 'Tickets vendus',
            data: data.map((e) => e.ticketCount),
            backgroundColor: '#8b5cf6',
            borderRadius: 6,
            borderSkipped: false,
            barThickness: 28,
          },
          {
            label: 'Capacité restante',
            data: data.map((e) => Math.round(capacity - e.ticketCount)),
            backgroundColor: 'rgba(226,232,240,0.5)',
            borderRadius: 6,
            borderSkipped: false,
            barThickness: 28,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.x ?? 0}`,
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: GRID_CONFIG,
            ticks: {
              ...TICK_CONFIG,
              callback: (v) => Number(v).toLocaleString('fr-FR'),
            },
          },
          y: {
            stacked: true,
            grid: { display: false },
            ticks: TICK_CONFIG,
          },
        },
      },
    });
    return () => chart.destroy();
  }, [data, visible]);

  return (
    <div className="space-y-5">
      {/* Légende */}
      <div className="flex flex-wrap gap-4">
        <span className="flex items-center gap-2 text-xs font-medium text-muted">
          <span className="w-2.5 h-2.5 rounded-sm bg-violet-500" />
          Tickets vendus
        </span>
        <span className="flex items-center gap-2 text-xs font-medium text-muted">
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-200" />
          Capacité restante
        </span>
      </div>

      {/* Canvas Chart */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: `${data.length * 52 + 40}px`,
        }}
      >
        <canvas ref={canvasRef} />
      </div>

      {/* Labels numérotés en dessous */}
      <div className="space-y-2 pt-2 border-t border-muted/10">
        {data.map((event, i) => (
          <div
            key={event.id}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-black text-brand/40 shrink-0">
                0{i + 1}
              </span>
              <span className="font-bold text-title text-sm truncate">
                {event.title}
              </span>
            </div>
            <span className="text-xs font-black bg-brand/10 text-brand px-3 py-1 rounded-full shrink-0">
              {event.ticketCount.toLocaleString('fr-FR')} tickets
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Card Wrapper générique ---
interface ChartCardProps {
  title: string;
  sub?: string;
  children: React.ReactNode;
}

function ChartCard({ title, sub, children }: ChartCardProps) {
  return (
    <div className="bg-surface border border-muted/10 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-title">{title}</h3>
        {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

// --- Composant principal ---
export default function AdminDashboardGraph({ data }: { data: DashboardData }) {
  const { users, events, tickets, payments, lottery } = data;
  const { ref: chartsRef, inView: chartsVisible } = useInView(0.05);

  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(data.generatedAt));

  return (
    <div className="bg-background min-h-screen text-foreground pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-brand mb-2">
              Statistiques Globales
            </div>
            <h1 className="text-4xl font-black text-title tracking-tight leading-none uppercase">
              Vue Analytique
            </h1>
          </div>
          <div className="text-xs font-bold text-muted bg-surface border border-muted/20 px-5 py-2.5 rounded-xl">
            Dernière sync • {formattedDate}
          </div>
        </div>

        {/* KPIs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <KpiCard
            label="Utilisateurs"
            value={users.total}
            sub={`+${users.newLast30Days} ce mois`}
            accent="#3b82f6"
            icon={<Users className="w-5 h-5" />}
          />
          <KpiCard
            label="Revenus Totaux"
            value={payments.totalRevenue}
            sub="FCFA"
            accent="#10b981"
            icon={<TrendingUp className="w-5 h-5" />}
            delay={100}
          />
          <KpiCard
            label="Événements"
            value={events.total}
            sub={`${events.active} actifs`}
            accent="#f59e0b"
            icon={<Calendar className="w-5 h-5" />}
            delay={300}
          />
          <KpiCard
            label="Tickets"
            value={tickets.total}
            sub={`${tickets.scanRate}% scannés`}
            accent="#8b5cf6"
            icon={<Ticket className="w-5 h-5" />}
            delay={400}
          />
        </div>

        {/* Charts Grid */}
        <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Évolution des Revenus */}
          <Card
            title="Évolution des Revenus"
            sub="Ventes de tickets sur les 7 derniers jours"
          >
            <RevenueLineChart
              data={payments.dailyRevenue || [0, 0, 0, 0, 0, 0, 0]}
              visible={chartsVisible}
            />
          </Card>

          {/* Validation des Tickets */}
          <Card
            title="Validation des Tickets"
            sub="Rapport scan vs émission"
            legend={[
              { color: '#10b981', label: 'Validés' },
              { color: '#e2e8f0', label: 'En attente' },
            ]}
          >
            <TicketsDoughnut
              data={tickets.byStatus}
              total={tickets.total}
              visible={chartsVisible}
            />
          </Card>

          {/* Utilisateurs par Rôle */}
          <Card
            title="Utilisateurs par Rôle"
            sub="Répartition de la base de données"
          >
            <RolesChart data={users.byRole} visible={chartsVisible} />
          </Card>

          {/* Loteries & Engagements */}
          <Card
            title="Loteries & Engagements"
            sub="Participations aux tirages au sort"
          >
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center p-4 bg-background rounded-xl border border-muted/5">
                <span className="text-sm font-bold text-muted">
                  Total Entrées
                </span>
                <span className="text-2xl font-black text-title">
                  {lottery.totalEntries}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-background rounded-xl border border-muted/5">
                <span className="text-sm font-bold text-muted">
                  Gagnants Notifiés
                </span>
                <span className="text-2xl font-black text-brand">
                  {lottery.prizesAwarded}
                </span>
              </div>
            </div>
          </Card>

          {/* Top Événements — pleine largeur avec bar chart horizontal */}
          <div className="lg:col-span-2">
            <ChartCard
              title="Top Événements"
              sub="Basé sur le volume de ventes"
            >
              <TopEventsBarChart
                data={events.topEvents}
                visible={chartsVisible}
              />
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  );
}

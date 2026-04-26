'use client';
import { useEffect, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Ticket,
  PieChart,
  BarChart3,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Target,
  ArrowRight,
} from 'lucide-react';
import { TicketType } from '../../module/tickets/typesTicket/domain/entities/ticketType.entity';
import { TicketTypeRepository } from '../../module/tickets/typesTicket/infrastructure/ticketType.repository';
import { TicketTypeService } from '../../module/tickets/typesTicket/application/typeTicket.service';
// --- Types ---
interface AnalyticsData {
  totalRevenuePotential: number;
  totalTicketsAvailable: number;
  averagePrice: number;
  ticketTypeDistribution: Array<{
    name: string;
    value: number;
    percentage: number;
    revenue: number;
    color: string;
  }>;
  priceRange: { min: number; max: number };
}
interface Props {
  eventId: string;
}

interface DonutAccumulator {
  elements: React.ReactNode[];
  offset: number;
}
const CHART_COLORS = ['#0d9488', '#f97316', '#22c55e', '#6366f1', '#ec4899'];
const typeTicketService = new TicketTypeService(new TicketTypeRepository());

type StatColor = 'teal' | 'orange' | 'green' | 'indigo';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode; // Permet de passer des composants Lucide
  color: StatColor;
  trend?: string; // Optionnel avec le "?"
  isSmall?: boolean; // Optionnel
}
export default function EventAnalytics({ eventId }: Props) {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchDataAndCalculate();
  }, [eventId]);

  const fetchDataAndCalculate = async () => {
    try {
      setLoading(true);
      const data = await typeTicketService.findAllByEventId(eventId);
      setTicketTypes(data);
      setAnalytics(calculateAnalytics(data));
    } catch (error) {
      console.error('Erreur analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (types: TicketType[]): AnalyticsData => {
    if (types.length === 0)
      return {
        totalRevenuePotential: 0,
        totalTicketsAvailable: 0,
        averagePrice: 0,
        ticketTypeDistribution: [],
        priceRange: { min: 0, max: 0 },
      };
    const totalRev = types.reduce(
      (sum, t) => sum + t.price * (t.quantity || 0),
      0,
    );
    const totalTickets = types.reduce((sum, t) => sum + (t.quantity || 0), 0);
    const avg = types.reduce((sum, t) => sum + t.price, 0) / types.length;
    const dist = types.map((t, i) => ({
      name: t.name,
      value: t.quantity || 0,
      percentage:
        totalTickets > 0
          ? Math.round(((t.quantity || 0) / totalTickets) * 100)
          : 0,
      revenue: t.price * (t.quantity || 0),
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
    const prices = types.map((t) => t.price);
    return {
      totalRevenuePotential: totalRev,
      totalTicketsAvailable: totalTickets,
      averagePrice: avg,
      ticketTypeDistribution: dist,
      priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
    };
  };
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('fr-CI', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(val);
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-teal-500/20"></div>
        <p className="text-slate-400 font-medium animate-pulse uppercase text-[10px] tracking-widest font-title">
          Chargement des statistiques...
        </p>
      </div>
    );
  if (!analytics)
    return (
      <div className="text-center py-12 text-slate-400">
        Aucune donnée disponible
      </div>
    );
  return (
    <div className="space-y-10 bg-background animate-in fade-in slide-in-from-bottom-4 duration-700  py-10 px-4 md:px-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-[10px] uppercase tracking-[0.2em]">
            <Activity className="w-3 h-3" /> Report Center
          </div>
          <h2 className="text-4xl font-black font-title text-slate-900 dark:text-white">
            Analytics <span className="text-orange-500">Billetterie</span>
          </h2>
        </div>
        <div className="px-5 py-2.5 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-500 flex items-center gap-2 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-green-500" /> Données sécurisées
        </div>
      </div>
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
        <StatCard
          label="CA Prévisionnel"
          value={formatCurrency(analytics.totalRevenuePotential)}
          icon={<DollarSign className="w-5 h-5" />}
          color="teal"
          trend="+8.2%"
        />
        <StatCard
          label="Capacité Totale"
          value={analytics.totalTicketsAvailable.toLocaleString()}
          icon={<Ticket className="w-5 h-5" />}
          color="orange"
        />
        <StatCard
          label="Panier Moyen"
          value={formatCurrency(analytics.averagePrice)}
          icon={<Target className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="Range de Prix"
          value={`${formatCurrency(analytics.priceRange.min)} - ${formatCurrency(analytics.priceRange.max)}`}
          icon={<ArrowUpRight className="w-5 h-5" />}
          color="indigo"
          isSmall
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BAR CHART STOCKS */}
        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <h3 className="text-lg font-black font-title text-slate-800 dark:text-white mb-8 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-teal-500" /> Répartition des
            Stocks
          </h3>
          <div className="space-y-6">
            {analytics.ticketTypeDistribution.map((type, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    {type.name}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {type.value} places
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${type.percentage}%`,
                      backgroundColor: type.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* DONUT STRATEGIE */}
        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <h3 className="text-lg font-black font-title text-slate-800 dark:text-white mb-8 flex items-center gap-3">
            <PieChart className="w-5 h-5 text-orange-500" /> Poids Stratégique
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-around gap-8">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {
                  analytics.ticketTypeDistribution.reduce(
                    (acc: DonutAccumulator, type) => {
                      const p = type.percentage / 100;
                      const c = 2 * Math.PI * 38;
                      const o = acc.offset;
                      acc.elements.push(
                        <circle
                          key={type.name}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke={type.color}
                          strokeWidth="10"
                          strokeDasharray={`${p * c} ${c}`}
                          strokeDashoffset={-o}
                          className="transition-all duration-1000"
                        />,
                      );
                      acc.offset += p * c;
                      return acc;
                    },
                    { elements: [], offset: 0 },
                  ).elements
                }
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {analytics.ticketTypeDistribution.length}
                </span>
                <span className="text-[8px] uppercase font-bold text-slate-400">
                  Types
                </span>
              </div>
            </div>
            <div className="space-y-2.5">
              {analytics.ticketTypeDistribution.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {t.name}
                  </span>
                  <span className="text-[11px] font-black text-teal-600">
                    {t.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* TABLEAU RÉCAPITULATIF - RÉINTRODUIT & AMÉLIORÉ */}
      <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-black font-title text-slate-800 dark:text-white">
            Détails de la Structure Financière
          </h3>
          <ArrowRight className="w-5 h-5 text-slate-300" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/5">
                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Catégorie
                </th>
                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Prix Unitaire
                </th>
                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Volume
                </th>
                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Revenu Estimé
                </th>
                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Poids
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {analytics.ticketTypeDistribution.map((type, i) => (
                <tr
                  key={i}
                  className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full ring-4 ring-opacity-20"
                        style={{
                          backgroundColor: type.color,
                          boxShadow: `0 0 0 4px ${type.color}33`, 
                        }}
                      />
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {type.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-8 text-right font-title font-bold text-slate-600 dark:text-slate-400">
                    {formatCurrency(ticketTypes[i]?.price || 0)}
                  </td>
                  <td className="py-5 px-8 text-right text-sm font-medium text-slate-500">
                    {type.value.toLocaleString()}
                  </td>
                  <td className="py-5 px-8 text-right font-title font-black text-teal-600 dark:text-teal-400">
                    {formatCurrency(type.revenue)}
                  </td>
                  <td className="py-5 px-8 text-right">
                    <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-white/10 rounded-full text-[10px] font-black text-slate-500 dark:text-slate-400">
                      {type.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-900 dark:bg-teal-950/40 text-white">
              <tr>
                <td className="py-6 px-8 font-title font-black uppercase tracking-tighter text-lg">
                  Total Global
                </td>
                <td colSpan={2}></td>
                <td className="py-6 px-8 text-right font-title font-black text-2xl text-orange-500">
                  {formatCurrency(analytics.totalRevenuePotential)}
                </td>
                <td className="py-6 px-8 text-right font-black text-sm text-teal-400">
                  100%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  trend,
  isSmall,
}: StatCardProps) {
  // Typage strict de la colorMap avec Record<Clé, Valeur>
  const colorMap: Record<StatColor, string> = {
    teal: 'from-teal-500/20 text-teal-600 shadow-teal-500/10',
    orange: 'from-orange-500/20 text-orange-600 shadow-orange-500/10',
    green: 'from-green-500/20 text-green-600 shadow-green-500/10',
    indigo: 'from-indigo-500/20 text-indigo-600 shadow-indigo-500/10',
  };
  return (
    <div className="group bg-white dark:bg-slate-900/40 p-7 rounded-[2.5rem] border border-slate-200 dark:border-white/5 transition-all hover:shadow-2xl">
      <div
        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <p className="text-[6px] font-black uppercase tracking-widest text-slate-400 mb-1">
        {label}
      </p>
      <h4
        className={`font-title font-black text-slate-900 dark:text-white tracking-tighter ${isSmall ? 'text-lg' : 'text-3xl'}`}
      >
        {value}
      </h4>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-green-500">
          <div className="p-0.5 bg-green-500/10 rounded">
            <TrendingUp className="w-3 h-3" />
          </div>
          {trend}{' '}
          <span className="text-slate-400 font-medium lowercase">vs hier</span>
        </div>
      )}
    </div>
  );
}

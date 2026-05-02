'use client';

import { useEffect, useState, useMemo, useSyncExternalStore } from 'react';
import {
  Users,
  DollarSign,
  Ticket,
  Award,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Activity,
  Sparkles,
  Crown,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Image from 'next/image';
import { AdminRepository } from '../module/infrastructure/admin.repository';
import { AdminEventDTO } from '../module/domain/entities/admin-event.dto';
import { Button } from '../../components/ui/Button';
import { CreateTicketTypeDTO } from '../../module/tickets/typesTicket/domain/entities/ticketType.entity';
import { CreateTicketFormValues } from './ValuedateTypeTicketDto';
import { TicketTypeRepository } from '../../module/tickets/typesTicket/infrastructure/ticketType.repository';
import { TicketTypeService } from '../../module/tickets/typesTicket/application/typeTicket.service';
import { CreateTicketModal } from './TypeTicketForm';
import { formatShortDate } from '../../utils/types/conversion.data';
import SectionButton from './EventButton';
import EditEventModal from './Update-form-event';
import { UpdateEventDto } from '../../module/event/domain/entities/event.entity';
import { EventRepository } from '../../module/event/infrastructure/event.repository';
import { EventService } from '../../module/event/application/event.service';
import { CreatePrizeFormValues } from './ValidatePrizeForm';
import { PrizeRepository } from '../../module/prizes/infrastructure/prize.repositrory';
import PrizeFormModal from './PrizeForm';
import { CreatePrizeDTO } from '../../module/prizes/domain/entities/prize.entity';
import TypeTicket from './Type-ticket';
import { useRouter } from 'next/navigation';
import { generateEventSummaryPDF } from './printTicket/PrintfEvent';
import { toast } from 'react-toastify';
import GateFormModal from './tickets/templates/GateFormModal';

// ─── Theme Management ────────────────────────────────────────────────────────
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

// ============================================
// COMPOSANT STATCARD (Version Pro)
// ============================================
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  subtitle?: string;
  colorClass: string;
  isDark: boolean;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  colorClass,
  isDark,
}: StatCardProps) => {
  const t = {
    card: isDark
      ? 'bg-[#111827]/50 border-white/[0.08]'
      : 'bg-white border-gray-200',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
    textMain: isDark ? 'text-white' : 'text-gray-900',
  };

  return (
    <div
      className={`border rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md group ${t.card} backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p
            className={`text-xs font-bold uppercase tracking-wider mb-1 ${t.textMuted}`}
          >
            {title}
          </p>
          <h3 className={`text-2xl font-black ${t.textMain}`}>{value}</h3>
        </div>
        <div
          className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${colorClass} bg-current/10`}
        >
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        {trend !== undefined && (
          <div
            className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}
          >
            {trend >= 0 ? (
              <ArrowUpRight size={12} className="mr-1" />
            ) : (
              <ArrowDownRight size={12} className="mr-1" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
        {subtitle && (
          <span className={`text-xs font-medium ${t.textMuted}`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Shared Services ──────────────────────────────────────────────────────────
const ticketTypeRepo = new TicketTypeRepository();
const ticketTypeService = new TicketTypeService(ticketTypeRepo);
const eventRepo = new EventRepository();
const eventService = new EventService(eventRepo);
const prizeRepo = new PrizeRepository();

export default function EventDashboard({ eventId }: { eventId: string }) {
  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => false,
  );
  const router = useRouter();

  const [data, setData] = useState<AdminEventDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const [isGateModalOpen, setIsGateModalOpen] = useState(false);

  const adminRepository = useMemo(() => new AdminRepository(), []);

  // ─── Design Tokens ─────────────────────────────────────────────────────────
  const t = {
    page: isDark ? 'bg-[#030712]' : 'bg-[#f8fafc]',
    card: isDark
      ? 'bg-[#111827] border-white/[0.08]'
      : 'bg-white border-gray-200',
    title: isDark ? 'text-white' : 'text-gray-900',
    subtitle: isDark ? 'text-gray-400' : 'text-gray-500',
    accent: 'text-teal-500',
    progressBg: isDark ? 'bg-white/5' : 'bg-gray-100',
  };

  // ─── Actions ───────────────────────────────────────────────────────────────
  const fetchDashboard = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const dashboardData = await adminRepository.getAdminEventsStats(eventId);
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [eventId, adminRepository]);

  const handleUpdateEvent = async (dto: UpdateEventDto, file: File | null) => {
    try {
      setLoading(true);
      await eventService.update(eventId, dto, file);
      await fetchDashboard();
      setIsEditModalOpen(false);
      toast.success('Événement mis à jour !');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

   const handleCreatePrize = async (
     data: CreatePrizeFormValues,

     file: File | null,
   ) => {
     try {
       // On crée un objet qui respecte strictement l'interface CreatePrizeDTO

       const prizeDto: CreatePrizeDTO = {
         title: data.title,

         description: data.description,

         lotteryId: data.lotterId, // On renomme 'lotterId' en 'lotteryId'

         imageUrl: '', // On initialise à vide, le repository s'occupera du fichier
       };

       await prizeRepo.create(prizeDto, file);

       setIsPrizeModalOpen(false);

       // Refresh data...
     } catch (err) {
       console.error(err);
     }
   };

   useEffect(() => {
     const fetchDashboard = async () => {
       if (!eventId) return;

       try {
         setLoading(true);

         const dashboardData =
           await adminRepository.getAdminEventsStats(eventId);

         setData(dashboardData);
       } catch (err) {
         setError(err instanceof Error ? err.message : 'Erreur de chargement');
       } finally {
         setLoading(false);
       }
     };

     fetchDashboard();
   }, [eventId, adminRepository]);


  const handleCreateTicketType = async (formData: CreateTicketFormValues) => {
    try {
      setLoading(true);

      const finalDto: CreateTicketTypeDTO = {
        ...formData,

        saleStart: new Date(formData.saleStart),

        saleEnd: new Date(formData.saleEnd),
      };

      await ticketTypeService.create(finalDto);

      const updatedData = await adminRepository.getAdminEventsStats(eventId);

      setData(updatedData);

      setIsModalOpen(false);

      toast.success('Type de ticket créé avec succès!');
    } catch (err) {
      console.error('Erreur lors de la création:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteEvent = async () => {
    if (!confirm('Changer le statut de cet événement ?')) return;
    try {
      setLoading(true);
      await eventService.toggleEventStatus(eventId);
      await fetchDashboard();
      toast.success('Statut mis à jour !');
    } finally {
      setLoading(false);
    }
  };
  const formatCurrency = (amount: number) =>
    `${amount.toLocaleString('fr-FR')} FCFA`;

  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${t.page}`}
      >
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-teal-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-teal-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );

  if (error || !data)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${t.page} p-6`}
      >
        <div
          className={`text-center p-10 rounded-3xl border shadow-xl ${t.card}`}
        >
          <XCircle
            className="mx-auto mb-4 text-red-500"
            size={60}
            strokeWidth={1.5}
          />
          <h2 className={`text-xl font-bold ${t.title}`}>
            {error || 'Événement introuvable'}
          </h2>
        </div>
      </div>
    );

  return (
    <div
      className={`min-h-screen ${t.page} py-10 px-4 md:px-10 transition-colors duration-300`}
    >
      {/* ── Section Actions ── */}
      <SectionButton
        onAddTicket={() => setIsModalOpen(true)}
        onEditEvent={() => setIsEditModalOpen(true)}
        onAddLotteryPrize={() => setIsPrizeModalOpen(true)}
        hasLottery={!!data?.lottery}
        onViewHistory={() =>
          router.push(`/frontend/admin/page/history/${data.event.id}`)
        }
        onAnalytic={() =>
          router.push(`/frontend/admin/page/events/analytic/${data.event.id}`)
        }
        onGate={() => setIsGateModalOpen(true)}
        onPrintSummary={() => generateEventSummaryPDF(data)}
      />

      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={{ ...data.event, isActivate: data.event.isActive }}
        onSubmit={handleUpdateEvent}
      />

      <GateFormModal
        isOpen={isGateModalOpen}
        onClose={() => setIsGateModalOpen(false)}
        eventId={eventId}
        onSuccess={() => fetchDashboard()} // Rafraîchir les données si nécessaire
      />
      {data.lottery !== null && (
        <PrizeFormModal
          isOpen={isPrizeModalOpen}
          onClose={() => setIsPrizeModalOpen(false)}
          onSubmit={handleCreatePrize}
          lotterId={data.lottery?.lotteryId}
        />
      )}
      <div className="max-w-7xl mx-auto mt-8 space-y-8">
        {/* ── Header Card ── */}
        <div
          className={`relative overflow-hidden border rounded-3xl p-8 ${t.card} transition-all`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-3xl -mr-32 -mt-32 rounded-full" />

          <div className="relative flex flex-col md:flex-row gap-8 items-center">
            <div className="relative w-44 h-44 flex-shrink-0">
              <Image
                src={data.event.imageUrl || '/placeholder.jpg'}
                alt={data.event.title}
                fill
                className="object-cover rounded-2xl shadow-2xl ring-4 ring-white/10"
              />
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span
                  className={`px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border ${
                    data.event.isActive
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                  }`}
                >
                  {data.event.isActive
                    ? '• Événement Actif'
                    : '• Session Clôturée'}
                </span>
              </div>

              <h1 className={`text-4xl font-black tracking-tight ${t.title}`}>
                {data.event.title}
              </h1>

              <div
                className={`flex flex-wrap justify-center md:justify-start gap-6 text-sm font-semibold ${t.subtitle}`}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-teal-500" />{' '}
                  {new Date(data.event.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-teal-500" />{' '}
                  {data.event.location}
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-teal-500" />{' '}
                  {data.event.organizerName}
                </div>
              </div>
              <div className="pt-4 flex justify-center md:justify-start">
                <Button
                  onClick={handleDeleteEvent}
                  className={`rounded-xl px-4 py-3 font-bold shadow-lg transition-all active:scale-95 ${
                    data.event.isActive
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {data.event.isActive ? (
                    <>
                      <XCircle className="mr-2" size={20} /> Clôturer la
                      billetterie
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2" size={20} /> Réouvrir les
                      ventes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <CreateTicketModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateTicketType}
          eventId={eventId}
          isLoading={loading}
        />
        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            isDark={isDark}
            title="Tickets Vendus"
            value={data.ticketStats.totalSold}
            icon={Ticket}
            colorClass="text-teal-500"
            subtitle={`Objectif: ${data.ticketStats.totalAvailable}`}
          />
          <StatCard
            isDark={isDark}
            title="Taux de Remplissage"
            value={`${data.ticketStats.salesRate}%`}
            icon={PieChart}
            colorClass="text-blue-500"
            trend={5}
          />
          <StatCard
            isDark={isDark}
            title="Revenus Totaux"
            value={formatCurrency(data.revenue.total)}
            icon={DollarSign}
            colorClass="text-emerald-500"
          />
          <StatCard
            isDark={isDark}
            title="Engagement Tombola"
            value={data.lottery?.totalEntries || 0}
            icon={Crown}
            colorClass="text-purple-500"
          />
        </div>

        {/* ── Analytics & Verification ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance par catégorie */}
          <div className={`lg:col-span-2 border rounded-3xl p-8 ${t.card}`}>
            <h2
              className={`text-xl font-black mb-8 flex items-center gap-3 ${t.title}`}
            >
              <div className="p-2 rounded-lg bg-teal-500/10">
                <BarChart3 className="text-teal-500" size={24} />
              </div>
              Performance des Catégories
            </h2>
            <div className="space-y-8">
              {data.ticketStats.byType.map((type, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <p className={`font-bold text-lg ${t.title}`}>
                        {type.typeName}
                      </p>
                      <p className={`text-xs font-medium ${t.subtitle}`}>
                        Prix: {formatCurrency(type.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-black ${t.title}`}>
                        {type.sold}
                      </span>
                      <span className={`text-sm font-medium ${t.subtitle}`}>
                        {' '}
                        / {type.available}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`h-3 w-full rounded-full overflow-hidden ${t.progressBg}`}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                      style={{
                        width: `${(type.sold / (type.available || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 flex justify-end">
                    <span className="text-xs font-bold text-teal-500">
                      {formatCurrency(type.revenue)} générés
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* États des tickets */}
          <div className={`border rounded-3xl p-8 ${t.card}`}>
            <h2
              className={`text-xl font-black mb-8 flex items-center gap-3 ${t.title}`}
            >
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="text-blue-500" size={24} />
              </div>
              Flux de Validation
            </h2>
            <div className="space-y-4">
              {[
                {
                  label: 'Confirmés',
                  val: data.ticketStats.byStatus.valid,
                  icon: CheckCircle,
                  color: 'text-emerald-500',
                  bg: 'bg-emerald-500/5',
                },
                {
                  label: 'Scannés',
                  val: data.ticketStats.byStatus.used,
                  icon: Activity,
                  color: 'text-blue-500',
                  bg: 'bg-blue-500/5',
                },
                {
                  label: 'Annulés',
                  val: data.ticketStats.byStatus.cancelled,
                  icon: XCircle,
                  color: 'text-red-500',
                  bg: 'bg-red-500/5',
                },
              ].map((status, i) => (
                <div
                  key={i}
                  className={`p-5 rounded-2xl border border-transparent hover:border-white/10 transition-all ${status.bg} flex items-center justify-between`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm ${status.color}`}
                    >
                      <status.icon size={20} strokeWidth={2.5} />
                    </div>
                    <span className={`font-bold ${t.title}`}>
                      {status.label}
                    </span>
                  </div>
                  <span
                    className={`text-2xl font-black tracking-tighter ${t.title}`}
                  >
                    {status.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section Tombola (Version Pro) ── */}
        {data.lottery && (
          <div
            className={`rounded-[2.5rem] p-8 md:p-12 shadow-2xl border relative overflow-hidden transition-all duration-500 ${
              isDark
                ? 'bg-gradient-to-br from-purple-900/40 via-black to-slate-900 border-purple-500/20'
                : 'bg-gradient-to-br from-purple-50 via-white to-pink-50 border-purple-100'
            }`}
          >
            <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
              <Crown size={200} />
            </div>

            <div className="relative flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="p-4 bg-purple-500 rounded-2xl shadow-xl shadow-purple-500/20 text-white">
                  <Sparkles size={32} />
                </div>
                <div>
                  <h2 className={`text-3xl font-black ${t.title}`}>
                    Tombola Exclusive
                  </h2>
                  <p className={`font-medium ${t.subtitle}`}>
                    Suivi des tirages en temps réel
                  </p>
                </div>
              </div>
              <div
                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                  data.lottery.isActive
                    ? 'bg-emerald-500 text-white animate-pulse'
                    : 'bg-gray-500/20 text-gray-500'
                }`}
              >
                {data.lottery.isActive ? 'Session en cours' : 'Terminée'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  icon: Award,
                  label: 'Prix en jeu',
                  val: data.lottery.totalPrizes,
                  color: 'text-yellow-500',
                },
                {
                  icon: Users,
                  label: 'Participants',
                  val: data.lottery.totalEntries,
                  color: 'text-blue-500',
                },
                {
                  icon: TrendingUp,
                  label: 'Tirages faits',
                  val: data.lottery.totalDraws,
                  color: 'text-emerald-500',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`p-8 rounded-3xl text-center border transition-all hover:scale-105 ${t.card}`}
                >
                  <item.icon
                    className={`mx-auto mb-4 ${item.color}`}
                    size={40}
                    strokeWidth={1.5}
                  />
                  <p className={`text-4xl font-black mb-1 ${t.title}`}>
                    {item.val}
                  </p>
                  <p
                    className={`text-xs font-bold uppercase tracking-widest ${t.subtitle}`}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Liste des Gagnants */}
            {data.lottery.winners.length > 0 && (
              <div className="space-y-4 relative">
                <h3 className={`text-lg font-black mb-6 px-2 ${t.title}`}>
                  Derniers Heureux Gagnants
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.lottery.winners.slice(0, 4).map((winner, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border flex items-center gap-4 transition-all hover:shadow-lg ${t.card} bg-opacity-50 backdrop-blur-xl group`}
                    >
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:rotate-12 transition-transform">
                          {winner.luckyNumber}
                        </div>
                        <div className="absolute -top-1 -right-1 bg-yellow-500 text-[8px] p-1 rounded-md text-black font-black uppercase">
                          Win
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-black truncate ${t.title}`}>
                          {winner.userName}
                        </p>
                        <p className="text-xs text-purple-500 font-bold flex items-center gap-1">
                          <Crown size={12} /> {winner.prizeTitle}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-[10px] font-bold opacity-50 uppercase ${t.subtitle}`}
                        >
                          Le {formatShortDate(winner.wonAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-8">
          <TypeTicket eventId={eventId} />
        </div>
      </div>
    </div>
  );
}

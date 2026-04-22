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
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Sparkles,
  Crown,
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
import toast from 'react-hot-toast';
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

// ─── Theme store (même pattern qu'AdminEventPage) ─────────────────────────────
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
const getServerSnapshot = () => false;

// ============================================
// COMPOSANT STATCARD
// ============================================
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  subtitle?: string;
  iconColor: string;
  isDark: boolean;
}

const StatCard = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  iconColor,
  isDark,
}: StatCardProps) => {
  const t = {
    card: isDark
      ? 'bg-[#111827] border-white/[0.06]'
      : 'bg-white border-[#e5e7eb]',
    title: isDark ? 'text-[#9ca3af]' : 'text-[#6b7280]',
    value: isDark ? 'text-[#f9fafb]' : 'text-[#111827]',
    iconBg: isDark ? 'bg-white/[0.04]' : 'bg-[#f8fafc]',
    subtitle: isDark ? 'text-[#6b7280]' : 'text-[#9ca3af]',
  };

  return (
    <div
      className={`border rounded-xl p-5 shadow-sm transition-colors duration-200 ${t.card}`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className={`text-sm font-semibold ${t.title}`}>{title}</p>
        <div className={`${iconColor} ${t.iconBg} p-2 rounded-lg`}>{icon}</div>
      </div>
      <div className="flex flex-col">
        <h3 className={`text-2xl font-bold ${t.value}`}>{value}</h3>
        <div className="flex items-center mt-1 space-x-2">
          {trend !== undefined && (
            <span
              className={`text-xs font-bold ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
            >
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
          {subtitle && (
            <span className={`text-xs ${t.subtitle}`}>{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Services ─────────────────────────────────────────────────────────────────
const ticketTypeRepo = new TicketTypeRepository();
const ticketTypeService = new TicketTypeService(ticketTypeRepo);
const eventRepo = new EventRepository();
const eventService = new EventService(eventRepo);
const prizeRepo = new PrizeRepository();

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function EventDashboard({ eventId }: { eventId: string }) {
  // ─── Dark mode (même pattern qu'AdminEventPage) ──────────────────────────
  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerSnapshot,
  );

  // ─── Tokens dark/light ────────────────────────────────────────────────────
  const t = {
    page: isDark ? 'bg-[#030712]' : 'bg-[#f9fafb]',
    text: isDark ? 'text-[#f9fafb]' : 'text-[#111827]',
    textMuted: isDark ? 'text-[#9ca3af]' : 'text-[#6b7280]',
    card: isDark
      ? 'bg-[#111827] border-white/[0.06]'
      : 'bg-white border-[#e5e7eb]',
    cardInner: isDark ? 'bg-[#1f2937]' : 'bg-white',
    cardTitle: isDark ? 'text-[#f9fafb]' : 'text-[#111827]',
    cardSubtitle: isDark ? 'text-[#9ca3af]' : 'text-[#6b7280]',
    divider: isDark ? 'border-white/[0.06]' : 'border-[#f1f5f9]',
    tableHead: isDark
      ? 'bg-white/[0.03] text-[#6b7280]'
      : 'bg-[#f8fafc] text-[#9ca3af]',
    tableRow: isDark
      ? 'border-white/[0.04] hover:bg-white/[0.02]'
      : 'border-[#f1f5f9] hover:bg-[#f8fafc]',
    tableCell: isDark ? 'text-[#e2e8f0]' : 'text-[#1e293b]',
    tableCellMuted: isDark ? 'text-[#6b7280]' : 'text-[#94a3b8]',
    progressBg: isDark ? 'bg-white/[0.06]' : 'bg-[#f1f5f9]',
    lotterySectionBg: isDark
      ? 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-800/50'
      : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200',
    lotteryCard: isDark ? 'bg-[#1f2937]' : 'bg-white',
    lotteryTitle: isDark ? 'text-[#f9fafb]' : 'text-[#111827]',
    lotterySubtitle: isDark ? 'text-[#6b7280]' : 'text-[#9ca3af]',
    winnerCard: isDark ? 'bg-[#1f2937]' : 'bg-white',
    winnerName: isDark ? 'text-[#f9fafb]' : 'text-[#1f2937]',
    winnerMeta: isDark ? 'text-[#6b7280]' : 'text-[#9ca3af]',
    statusBadgeActive: isDark
      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
      : 'bg-emerald-100 text-emerald-700',
    statusBadgeInactive: isDark
      ? 'bg-white/[0.04] text-[#6b7280] border border-white/[0.08]'
      : 'bg-[#f1f5f9] text-[#6b7280]',
    ticketStatusConfirm: isDark ? 'bg-emerald-900/20' : 'bg-emerald-50/50',
    ticketStatusUsed: isDark ? 'bg-blue-900/20' : 'bg-blue-50/50',
    ticketStatusCancel: isDark ? 'bg-red-900/20' : 'bg-red-50/50',
    ticketStatusText: isDark ? 'text-[#cbd5e1]' : 'text-[#374151]',
    ticketStatusValue: isDark ? 'text-[#f9fafb]' : 'text-[#111827]',
  };

  const [data, setData] = useState<AdminEventDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const adminRepository = useMemo(() => new AdminRepository(), []);

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
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
    try {
      setLoading(true);
      await eventService.toggleEventStatus(eventId);
      toast.success('Événement mis à jour avec succès !');
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      toast.error("Erreur lors de la mise à jour de l'événement.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (dto: UpdateEventDto, file: File | null) => {
    try {
      setLoading(true);
      await eventService.update(eventId, dto, file);
      const refreshedData = await adminRepository.getAdminEventsStats(eventId);
      setData(refreshedData);
      setIsEditModalOpen(false);
      toast.success('Événement mis à jour avec succès !');
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      toast.error(
        "Une erreur est survenue lors de la modification de l'événement.",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    `${amount.toLocaleString('fr-FR')} FCFA`;

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${t.page} transition-colors duration-200`}
      >
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-teal-500" />
      </div>
    );

  // ─── Error ────────────────────────────────────────────────────────────────
  if (error || !data)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${t.page} p-6 transition-colors duration-200`}
      >
        <div
          className={`text-center p-8 rounded-xl border shadow-xl ${t.card}`}
        >
          <XCircle className="mx-auto mb-4 text-red-500" size={48} />
          <p className={`font-bold ${t.cardTitle}`}>
            {error || 'Événement introuvable'}
          </p>
        </div>
      </div>
    );

  const ticketStatusRows = [
    {
      label: 'Confirmés',
      val: data.ticketStats.byStatus.valid,
      icon: <CheckCircle className="text-emerald-500" />,
      bg: t.ticketStatusConfirm,
    },
    {
      label: 'Scanés',
      val: data.ticketStats.byStatus.used,
      icon: <Activity className="text-blue-500" />,
      bg: t.ticketStatusUsed,
    },
    {
      label: 'Annulés',
      val: data.ticketStats.byStatus.cancelled,
      icon: <XCircle className="text-red-500" />,
      bg: t.ticketStatusCancel,
    },
  ];

  return (
    <div
      className={`min-h-screen ${t.page} ${t.text} py-10 px-4 md:px-10 transition-colors duration-200`}
    >
      <SectionButton
        onAddTicket={() => setIsModalOpen(true)}
        onEditEvent={() => setIsEditModalOpen(true)}
        onAddLotteryPrize={() => setIsPrizeModalOpen(true)}
        hasLottery={!!data?.lottery}
      />
      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={{
          ...data.event,
          isActivate: data.event.isActive,
        }}
        onSubmit={handleUpdateEvent}
      />
      {data.lottery !== null && (
        <PrizeFormModal
          isOpen={isPrizeModalOpen}
          onClose={() => setIsPrizeModalOpen(false)}
          onSubmit={handleCreatePrize}
          lotterId={data.lottery?.lotteryId}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div
          className={`border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start transition-colors duration-200 ${t.card}`}
        >
          <div className="relative w-32 h-32 flex-shrink-0 mx-auto md:mx-0">
            <Image
              src={data.event.imageUrl || '/placeholder.jpg'}
              alt={data.event.title}
              fill
              className={`object-cover rounded-xl border ${isDark ? 'border-white/[0.08]' : 'border-[#e5e7eb]'}`}
            />
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start space-y-4 text-center md:text-left">
            {/* Badge Statut */}
            <span
              className={`px-3 py-1 text-[10px] font-black uppercase rounded-md inline-block ${
                data.event.isActive
                  ? t.statusBadgeActive
                  : t.statusBadgeInactive
              }`}
            >
              {data.event.isActive ? 'Événement Actif' : 'Clôturé'}
            </span>

            <h1 className={`text-3xl font-black leading-tight ${t.cardTitle}`}>
              {data.event.title}
            </h1>

            <div
              className={`flex flex-wrap justify-center md:justify-start gap-4 text-sm ${t.cardSubtitle}`}
            >
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(data.event.date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={14} /> {data.event.location}
              </div>
              <div className="flex items-center gap-1">
                <Users size={14} /> {data.event.organizerName}
              </div>
            </div>

            <div className="pt-2">
              {data.event.isActive ? (
                <Button
                  onClick={handleDeleteEvent}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle size={18} />
                  Clôturer l&apos;événement
                </Button>
              ) : (
                <Button
                  onClick={handleDeleteEvent}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle size={18} />
                  Rouvrir l&apos;événement
                </Button>
              )}
            </div>
          </div>
          <CreateTicketModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateTicketType}
            eventId={eventId}
            isLoading={loading}
          />
        </div>
        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            isDark={isDark}
            title="Ventes"
            value={data.ticketStats.totalSold}
            icon={<Ticket />}
            iconColor="text-teal-500"
            subtitle={`/ ${data.ticketStats.totalAvailable}`}
          />
          <StatCard
            isDark={isDark}
            title="Remplissage"
            value={`${data.ticketStats.salesRate}%`}
            icon={<Activity />}
            iconColor="text-blue-500"
            trend={5}
          />
          <StatCard
            isDark={isDark}
            title="Recettes"
            value={formatCurrency(data.revenue.total)}
            icon={<DollarSign />}
            iconColor="text-emerald-600"
          />
          <StatCard
            isDark={isDark}
            title="Tombola"
            value={data.lottery?.totalEntries || 0}
            icon={<Award />}
            iconColor="text-purple-500"
          />
        </div>
        {/* ── Analytics ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance catégories */}
          <div
            className={`lg:col-span-2 border rounded-2xl p-6 transition-colors duration-200 ${t.card}`}
          >
            <h2
              className={`text-lg font-bold mb-6 flex items-center gap-2 ${t.cardTitle}`}
            >
              <PieChart size={20} className="text-teal-500" />
              Performance des catégories
            </h2>
            <div className="space-y-6">
              {data.ticketStats.byType.map((type, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span
                      className={`font-bold ${isDark ? 'text-[#e2e8f0]' : 'text-[#374151]'}`}
                    >
                      {type.typeName}
                    </span>
                    <span className={t.cardSubtitle}>
                      {type.sold} / {type.available}
                    </span>
                  </div>
                  <div
                    className={`h-2 w-full rounded-full overflow-hidden ${t.progressBg}`}
                  >
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${(type.sold / (type.available || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <div
                    className={`flex justify-between mt-2 text-[11px] font-medium ${t.tableCellMuted}`}
                  >
                    <span>Prix: {formatCurrency(type.price)}</span>
                    <span className="text-teal-500 font-bold">
                      {formatCurrency(type.revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* États des tickets */}
          <div
            className={`border rounded-2xl p-6 transition-colors duration-200 ${t.card}`}
          >
            <h2
              className={`text-lg font-bold mb-6 flex items-center gap-2 ${t.cardTitle}`}
            >
              <BarChart3 size={20} className="text-teal-500" />
              États des tickets
            </h2>
            <div className="space-y-3">
              {ticketStatusRows.map((status, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl flex items-center justify-between ${status.bg}`}
                >
                  <div className="flex items-center gap-3">
                    {status.icon}
                    <span
                      className={`text-sm font-medium ${t.ticketStatusText}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <span className={`font-black ${t.ticketStatusValue}`}>
                    {status.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* ── Tombola ── */}
        {data.lottery && (
          <div
            className={`rounded-2xl p-6 shadow-lg border transition-colors duration-200 ${t.lotterySectionBg}`}
          >
            <div className="flex items-center space-x-2 mb-6">
              <Crown className="w-6 h-6 text-purple-500" />
              <h2 className={`text-xl font-bold ${t.lotteryTitle}`}>Tombola</h2>
              <span
                className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${
                  data.lottery.isActive
                    ? 'bg-emerald-500 text-white'
                    : isDark
                      ? 'bg-white/[0.08] text-[#9ca3af]'
                      : 'bg-[#e5e7eb] text-[#6b7280]'
                }`}
              >
                {data.lottery.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                {
                  icon: (
                    <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  ),
                  value: data.lottery.totalPrizes,
                  label: 'Prix Disponibles',
                },
                {
                  icon: (
                    <Users className="w-8 h-8 text-teal-500 mx-auto mb-2" />
                  ),
                  value: data.lottery.totalEntries,
                  label: 'Participations',
                },
                {
                  icon: (
                    <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  ),
                  value: data.lottery.totalDraws,
                  label: 'Tirages Effectués',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`text-center p-4 rounded-xl transition-colors duration-200 ${t.lotteryCard}`}
                >
                  {item.icon}
                  <p className={`text-2xl font-black ${t.cardTitle}`}>
                    {item.value}
                  </p>
                  <p className={`text-xs mt-1 ${t.lotterySubtitle}`}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Gagnants */}
            {data.lottery.winners.length > 0 && (
              <div>
                <h3
                  className={`text-sm font-semibold mb-3 ${t.lotterySubtitle}`}
                >
                  Derniers Gagnants
                </h3>
                <div className="space-y-2">
                  {data.lottery.winners.slice(0, 5).map((winner, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-xl transition-colors duration-200 ${t.winnerCard}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-black text-sm">
                          {winner.luckyNumber}
                        </div>
                        <div>
                          <p
                            className={`font-semibold text-sm ${t.winnerName}`}
                          >
                            {winner.userName}
                          </p>
                          <p className={`text-xs ${t.winnerMeta}`}>
                            {winner.prizeTitle}
                          </p>
                        </div>
                      </div>
                      <div className={`text-right text-xs ${t.winnerMeta}`}>
                        {formatShortDate(winner.wonAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* ── Historique des ventes ── */}
        <TypeTicket eventId={eventId} />
      </div>
    </div>
  );
}

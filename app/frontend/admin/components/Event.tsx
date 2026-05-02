'use client';

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  CalendarDays,
  Ticket,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  PowerOff,
  Settings2,
  AlertCircle,
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { EventRepository } from '../../module/event/infrastructure/event.repository';
import { EventService } from '../../module/event/application/event.service';
import { formatFullDateTime } from '@/app/frontend/utils/types/conversion.data';
import {
  CreateEventDto,
  Event,
} from '../../module/event/domain/entities/event.entity';
import { LotteryRepository } from '../../module/lotteries/infrastructure/lottery.entity';
import { LotteryService } from '../../module/lotteries/application/lottery.service';
import EventFormModal from './FormEvent';
import AdminSearchBar from './search/Search';
import { toast } from 'react-toastify';

// ─── Theme store ──────────────────────────────────────────────────────────────
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

// ─── Services ─────────────────────────────────────────────────────────────────
const eventRepo = new EventRepository();
const serviceEvent = new EventService(eventRepo);
const lotteryRepo = new LotteryRepository();
const serviceLottery = new LotteryService(lotteryRepo);
const LIMIT = 4;

export default function AdminEventPage() {
  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerSnapshot,
  );

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCreateEvent = async (dto: CreateEventDto, file: File | null) => {
    try {
      // Appel à ton service (le code que tu as posté dans la question)
      await serviceEvent.create(dto, file);
      // Rafraîchir la liste après création
      fetchData(1);
      toast.success('Événement créé avec succès !');
    } catch (err) {
      toast.error('Erreur lors de la création');
    }
  };
  // -------------CREATE LOTTERY-----------------------------------------------
  const handleCreateLottery = async (eventId: string) => {
    try {
      const res = await lotteryRepo.create(eventId);
      toast.success(`Lottérie activée avec succès! ${res.event}`);
    } catch (error) {
      console.error('Error to created lottery');
    }
  };
  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await serviceEvent.findAll(LIMIT, page);
      setEvents(res.data);
      setPagination({
        page: res.page,
        totalPages: res.totalPages,
        total: res.total,
      });
    } catch {
      setError('Erreur lors de la récupération des événements.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  // ─── Toggle loterie ───────────────────────────────────────────────────────
  const toggleLottery = async (eventId: string, currentState: boolean) => {
    if (processingId) return;
    setProcessingId(eventId);
    try {
      await serviceLottery.toggleActivation(eventId);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, hasLottery: !currentState } : e,
        ),
      );
      toast.success(
        `Loterie ${!currentState ? 'activée' : 'désactivée'} avec succès !`,
      );
    } catch {
      toast.error(
        'Une erreur est survenue lors de la modification de la loterie.',
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchData(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredEvents = useMemo(
    () =>
      events.filter((e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [events, searchQuery],
  );

  // ─── Tokens dark/light ────────────────────────────────────────────────────
  const t = {
    page: isDark ? 'bg-[#030712]' : 'bg-[#f9fafb]',
    title: isDark ? 'text-[#f9fafb]' : 'text-[#111827]',
    subtitle: isDark ? 'text-[#9ca3af]' : 'text-[#6b7280]',
    card: isDark
      ? 'bg-[#111827] border-white/[0.06]'
      : 'bg-white border-[#e5e7eb]',
    cardHover: isDark
      ? 'hover:border-white/[0.12] hover:bg-[#1f2937]'
      : 'hover:shadow-md hover:border-[#d1d5db]',
    input: isDark
      ? 'bg-[#111827] border-white/[0.08] text-[#f9fafb] placeholder:text-[#6b7280] focus:border-[#0d9488]'
      : 'bg-white border-[#e5e7eb] text-[#111827] placeholder:text-[#9ca3af] focus:border-[#0d9488]',
    inputIcon: isDark ? 'text-[#6b7280]' : 'text-[#9ca3af]',
    eventTitle: isDark ? 'text-[#f9fafb]' : 'text-[#1f2937]',
    eventMeta: isDark ? 'text-[#9ca3af]' : 'text-[#6b7280]',
    divider: isDark ? 'border-white/[0.06]' : 'border-[#f1f5f9]',
    editBtn: isDark
      ? 'bg-white/[0.04] text-[#9ca3af] hover:bg-white/[0.08] hover:text-[#f9fafb] border-white/[0.06]'
      : 'bg-[#f8fafc] text-[#9ca3af] hover:bg-[#f1f5f9] hover:text-[#4b5563] border-[#e5e7eb]',
    pagination: isDark
      ? 'border-white/[0.08] text-[#9ca3af] hover:bg-white/[0.04] disabled:opacity-30'
      : 'border-[#e5e7eb] text-[#6b7280] hover:bg-white disabled:opacity-40',
    paginText: isDark ? 'text-[#9ca3af]' : 'text-[#4b5563]',
    empty: isDark
      ? 'bg-white/[0.02] border-white/[0.06] text-[#6b7280]'
      : 'bg-[#f8fafc] border-[#e5e7eb] text-[#9ca3af]',
    errorBox: isDark
      ? 'bg-red-500/10 border-red-500/20 text-red-400'
      : 'bg-red-50 border-red-200 text-red-600',
  };

  // ─── Erreur ───────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        className={`min-h-screen ${t.page} flex items-center justify-center`}
      >
        <div className="text-center">
          <div
            className={`inline-flex items-center gap-2 p-4 rounded-2xl border ${t.errorBox}`}
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
          <div className="mt-4">
            <Button onClick={() => fetchData(1)}>Réessayer</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t.page} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1
              className={`font-['Space_Grotesk',sans-serif] text-3xl font-bold tracking-tight ${t.title}`}
            >
              Gestion des Événements
            </h1>
            <p className={`mt-1 text-sm ${t.subtitle}`}>
              Pilotez les accès et les loteries de vos événements en temps réel.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-5 w-5" /> Créer un événement
          </Button>

          <EventFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateEvent}
          />
        </div>
        {/* ── Recherche ── */}
        <div className="relative mb-8 group">
          <AdminSearchBar></AdminSearchBar>
        </div>
        {/* ── Chargement ── */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-80 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#0d9488]" />
            <p className={`text-sm animate-pulse ${t.subtitle}`}>
              Chargement de la console...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`
                    group border rounded-2xl p-4
                    flex flex-col md:flex-row items-start md:items-center gap-5
                    transition-all duration-200
                    ${t.card} ${t.cardHover}
                  `}
                >
                  {/* Image */}
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden shrink-0">
                    <Image
                      src={event?.imageUrl ?? '/placeholder.jpg'}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      alt={event?.title}
                    />
                  </div>
                  {/* Infos */}
                  <div className="flex-grow min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3
                        className={`font-['Space_Grotesk',sans-serif] font-bold text-lg truncate ${t.eventTitle}`}
                      >
                        {event.title}
                      </h3>
                      <span
                        className={`
                        text-[10px] uppercase px-2.5 py-0.5 rounded-full font-bold border
                        transition-colors duration-200
                        ${
                          event.lottery?.isActive
                            ? isDark
                              ? 'bg-[#0d9488]/15 text-[#0d9488] border-[#0d9488]/25'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : isDark
                              ? 'bg-white/[0.04] text-[#6b7280] border-white/[0.08]'
                              : 'bg-[#f8fafc] text-[#9ca3af] border-[#e5e7eb]'
                        }
                      `}
                      >
                        {event.lottery?.isActive
                          ? 'Loterie Active'
                          : 'Sans Loterie'}
                      </span>
                    </div>

                    <div
                      className={`flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium ${t.eventMeta}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-[#0d9488]/70" />
                        {formatFullDateTime(event.date)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-[#0d9488]/70" />
                        <span className="truncate max-w-[200px]">
                          {event.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className={`
                    flex items-center gap-2.5 w-full md:w-auto
                    pt-3 md:pt-0 border-t md:border-none ${t.divider}
                  `}
                  >
                    {/* Toggle loterie */}
                    {!event.lottery && (
                      <div className="">
                        <Button>Activer la lotterie</Button>
                      </div>
                    )}
                    {/* SECTION LOGIQUE LOTERIE */}
                    {!event.lottery ? (
                      /* CAS 1 : La loterie n'existe pas du tout -> Bouton de création */
                      <div className="flex-1 md:flex-none">
                        <Button
                          onClick={() => handleCreateLottery(event.id)}
                          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-900/10 transition-all"
                        >
                          <Ticket className="h-4 w-4" />
                          <span className="whitespace-nowrap">
                            Initialiser la Loterie
                          </span>
                        </Button>
                      </div>
                    ) : (
                      /* CAS 2 : La loterie existe -> Bouton Toggle (Activer/Désactiver) */
                      <button
                        onClick={() =>
                          toggleLottery(
                            event.id,
                            event.lottery?.isActive ?? false,
                          )
                        }
                        disabled={processingId === event.id}
                        className={`
                    flex-1 md:flex-none flex items-center justify-center gap-2
                    px-5 py-2.5 rounded-xl text-sm font-bold
                    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      event.lottery?.isActive
                        ? isDark
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-transparent'
                          : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-transparent'
                        : isDark
                          ? 'bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-white border border-teal-500/20 hover:border-transparent'
                          : 'bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white border border-teal-200 hover:border-transparent'
                    }
                  `}
                      >
                        {processingId === event.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : event.lottery?.isActive ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Ticket className="h-4 w-4" />
                        )}
                        <span className="whitespace-nowrap">
                          {processingId === event.id
                            ? 'Traitement...'
                            : event.lottery?.isActive
                              ? 'Désactiver Loterie'
                              : 'Activer Loterie'}
                        </span>
                      </button>
                    )}
                    {/* Paramètres */}
                    <Link
                      href={`/frontend/admin/page/events/edit/${event.id}`}
                      className={`p-2.5 rounded-xl transition-all duration-150 border ${t.editBtn}`}
                      title="Paramètres de l'événement"
                    >
                      <Settings2 className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div
                className={`text-center py-20 rounded-3xl border-2 border-dashed ${t.empty}`}
              >
                <p className="font-medium">
                  Aucun événement trouvé pour «&nbsp;{searchQuery}&nbsp;»
                </p>
              </div>
            )}
          </div>
        )}
        {/* ── Pagination ── */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`p-2 rounded-lg border transition-colors disabled:cursor-not-allowed ${t.pagination}`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span
              className={`text-sm font-semibold px-4 font-['Inter',sans-serif] ${t.paginText}`}
            >
              Page {pagination.page} sur {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={`p-2 rounded-lg border transition-colors disabled:cursor-not-allowed ${t.pagination}`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

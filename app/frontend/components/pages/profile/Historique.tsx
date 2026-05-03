'use client';

import { useAuth } from '@/app/frontend/context/useContext';
import { TicketService } from '@/app/frontend/module/tickets/application/ticket.service';
import {
  EventDto,
  HistoriqueTicketDto,
} from '@/app/frontend/module/tickets/domain/entities/ticket.entity';
import { TicketRepository } from '@/app/frontend/module/tickets/infrastructure/ticket.repository';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import {
  MapPin,
  Calendar,
  Ticket,
  ChevronDown,
  ChevronUp,
  Printer,
  Loader2,
  Tag,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  X,
  QrCode,
} from 'lucide-react';
import { Button } from '../../ui/Button';

const ticketService = new TicketRepository();
const service = new TicketService(ticketService);
const PREVIEW_COUNT = 3;

// Types pour les filtres
type FilterType = 'all' | 'valid' | 'used' | 'cancelled';

interface FilterOption {
  value: FilterType;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  {
    value: 'all',
    label: 'Tous les billets',
    icon: <Ticket size={16} />,
    color: 'brand',
    description: 'Afficher tous vos billets',
  },
  {
    value: 'valid',
    label: 'Réservations en cours',
    icon: <Clock size={16} />,
    color: 'blue',
    description: 'Billets valides non encore utilisés',
  },
  {
    value: 'used',
    label: 'Utilisés',
    icon: <CheckCircle size={16} />,
    color: 'green',
    description: 'Billets déjà scannés',
  },
  {
    value: 'cancelled',
    label: 'Annulés',
    icon: <XCircle size={16} />,
    color: 'red',
    description: 'Billets annulés',
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  // 1. On définit l'objet de configuration à l'extérieur ou avant la sélection
  const statusConfig = {
    VALID: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      icon: <Clock size={10} />,
    },
    USED: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      icon: <CheckCircle size={10} />,
    },
    CANCELLED: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      icon: <XCircle size={10} />,
    },
  };
  // 2. On récupère la config correspondante ou la valeur par défaut (VALID)
  // On utilise un "type assertion" pour permettre l'indexation par string
  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.VALID;
  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${config.bg} ${config.text} ${config.border}`}
    >
      {config.icon}
      {status}
    </span>
  );
};

const TicketRow = ({ t }: { t: HistoriqueTicketDto }) => (
  <div className="flex items-center justify-between px-4 py-3 bg-background border border-gray-200 dark:border-gray-700 rounded-xl hover:border-brand/50 hover:shadow-md transition-all duration-200 group">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className="bg-brand/10 p-2 rounded-lg group-hover:bg-brand/20 transition-colors">
        <QrCode size={16} className="text-brand" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm font-black text-foreground truncate">
          {t.code}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <Tag size={10} />
          <span className="font-semibold">{t.ticketType.name}</span>
          <span>•</span>
          <span>{new Date(t.createdAt).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>
    </div>
    <StatusBadge status={t.status} />
  </div>
);

const EventCard = ({
  event,
  tickets,
  userId,
}: {
  userId: string;
  event: EventDto;
  tickets: HistoriqueTicketDto[];
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      await service.printTickets(userId, event.id);
    } catch (error) {
      console.error('Erreur impression:', error);
      alert('Impossible de générer les tickets pour le moment.');
    } finally {
      setIsPrinting(false);
    }
  };

  const visible = expanded ? tickets : tickets.slice(0, PREVIEW_COUNT);
  const hiddenCount = tickets.length - PREVIEW_COUNT;

  // Stats des tickets
  const stats = useMemo(() => {
    return {
      valid: tickets.filter((t) => t.status === 'VALID').length,
      used: tickets.filter((t) => t.status === 'USED').length,
      cancelled: tickets.filter((t) => t.status === 'CANCELLED').length,
    };
  }, [tickets]);

  return (
    <div className="bg-surface rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Layout adaptatif */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">
        {/* Image de l'événement */}
        <div className="relative h-64 lg:h-full overflow-hidden">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Badge événement */}
          <span className="absolute top-4 left-4 bg-brand/95 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
            <Tag size={12} /> Événement
          </span>

          {/* Info de l'événement */}
          <div className="absolute bottom-4 left-4 right-4 p-4 bg-black/50 backdrop-blur-md rounded-xl border border-white/20">
            <h2 className="font-title text-lg font-bold text-white leading-tight mb-3">
              {event.title}
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-white/90">
                <MapPin size={14} className="text-brand flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/90">
                <Calendar size={14} className="text-brand flex-shrink-0" />
                <span>
                  {new Date(event.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu des tickets */}
        <div className="p-6 flex flex-col">
          {/* Header avec stats */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="font-title text-sm font-bold text-muted uppercase tracking-widest flex items-center gap-2 mb-2">
                <Ticket size={16} /> Vos Billets
              </h3>
              <div className="flex items-center gap-3">
                <span className="bg-brand/10 text-brand text-xs font-black px-3 py-1.5 rounded-lg">
                  {tickets.length} Total
                </span>
                {stats.valid > 0 && (
                  <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
                    {stats.valid} Valide{stats.valid > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Bouton d'impression */}
            <Button
              onClick={handlePrint}
              disabled={isPrinting}
              className={`flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg ${
                isPrinting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-btn text-white hover:bg-btn/90 active:scale-95'
              }`}
            >
              {isPrinting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Printer size={16} />
              )}
              {isPrinting ? 'Génération...' : 'Tout Imprimer'}
            </Button>
          </div>

          {/* Liste des tickets */}
          <div className="flex-1 space-y-3 mb-6">
            {visible.map((t, i) => (
              <TicketRow key={i} t={t} />
            ))}

            {tickets.length > PREVIEW_COUNT && (
              <button
                onClick={() => setExpanded((p) => !p)}
                className="w-full mt-2 py-3 text-sm font-bold text-brand border-2 border-dashed border-brand/30 rounded-xl bg-brand/5 hover:bg-brand/10 transition-all flex items-center justify-center gap-2 group"
              >
                {expanded ? (
                  <>
                    <ChevronUp
                      size={16}
                      className="group-hover:-translate-y-1 transition-transform"
                    />
                    Voir moins
                  </>
                ) : (
                  <>
                    <ChevronDown
                      size={16}
                      className="group-hover:translate-y-1 transition-transform"
                    />
                    Voir {hiddenCount} autres billets
                  </>
                )}
              </button>
            )}
          </div>

          {/* Footer info */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-muted flex items-center gap-2">
              <QrCode size={14} className="text-brand" />
              Présentez votre code QR à l&apos;entrée de l&apos;événement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal de filtres
const FilterModal = ({
  isOpen,
  onClose,
  tickets,
  filterType,
}: {
  isOpen: boolean;
  onClose: () => void;
  tickets: HistoriqueTicketDto[];
  filterType: FilterType;
}) => {
  // ✅ 1. D'ABORD : Appeler TOUS les hooks (toujours dans le même ordre)
  const filterConfig = FILTER_OPTIONS.find((f) => f.value === filterType)!;

  const filteredTickets = useMemo(() => {
    if (!tickets) return [];

    if (filterType === 'all') return tickets;

    if (filterType === 'valid') {
      // Billets VALID qui ne sont pas USED
      return tickets.filter((t) => t.status === 'VALID');
    }

    const targetStatus = filterType.toUpperCase();
    return tickets.filter((t) => t.status === targetStatus);
  }, [tickets, filterType]);

  const groupedByEvent = useMemo(() => {
    return filteredTickets.reduce(
      (acc, ticket) => {
        if (!ticket.event?.id) return acc;

        const eventId = ticket.event.id;

        if (!acc[eventId]) {
          acc[eventId] = { event: ticket.event, tickets: [] };
        }

        acc[eventId].tickets.push(ticket);
        return acc;
      },
      {} as Record<string, { event: EventDto; tickets: HistoriqueTicketDto[] }>,
    );
  }, [filteredTickets]);

  // ✅ 2. ENSUITE : Faire le return conditionnel
  if (!isOpen) return null;

  // ✅ 3. ENFIN : Retourner le JSX
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-background rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header du modal */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-brand to-teal-600 text-white p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                {filterConfig.icon}
              </div>
              <div>
                <h2 className="text-2xl font-black">{filterConfig.label}</h2>
                <p className="text-sm text-white/80 mt-1">
                  {filterConfig.description}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all active:scale-95"
            >
              <X size={24} />
            </button>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
              <p className="text-xs text-white/80">Total</p>
              <p className="text-2xl font-black">{filteredTickets.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
              <p className="text-xs text-white/80">Événements</p>
              <p className="text-2xl font-black">
                {Object.keys(groupedByEvent).length}
              </p>
            </div>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {filteredTickets.length > 0 ? (
            <div className="space-y-6">
              {Object.values(groupedByEvent).map(
                ({ event, tickets: eventTickets }) => (
                  <div
                    key={event.id}
                    className="bg-surface rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Event header compact */}
                    <div className="flex items-center gap-4 p-4 bg-muted/5 border-b border-gray-200 dark:border-gray-700">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-brand/20">
                        <Image
                          src={event.imageUrl}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground truncate">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-muted mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(event.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      <span className="bg-brand/10 text-brand text-xs font-bold px-3 py-1.5 rounded-lg">
                        {eventTickets.length} billet
                        {eventTickets.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Tickets list */}
                    <div className="p-4 space-y-2">
                      {eventTickets.map((ticket, i) => (
                        <TicketRow key={i} t={ticket} />
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/10 flex items-center justify-center">
                <Ticket size={32} className="text-muted" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Aucun billet trouvé
              </h3>
              <p className="text-sm text-muted">
                Vous n&apos;avez pas de billets avec ce statut
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const TicketHistoryPage = () => {
  const [tickets, setTickets] = useState<HistoriqueTicketDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType | null>(null);
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (!user) return;
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await service.historyTicket(user.id, 50, 1);
        const data =
          response?.data || (Array.isArray(response) ? response : []);
        setTickets(data as unknown as HistoriqueTicketDto[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user]);

  const groupedByEvent = useMemo(() => {
    return tickets.reduce(
      (acc, ticket) => {
        if (!ticket.event?.id) return acc;

        const eventId = ticket.event.id;

        if (!acc[eventId]) {
          acc[eventId] = { event: ticket.event, tickets: [] };
        }

        acc[eventId].tickets.push(ticket);
        return acc;
      },
      {} as Record<string, { event: EventDto; tickets: HistoriqueTicketDto[] }>,
    );
  }, [tickets]);

  // Stats globales
  const stats = useMemo(() => {
    return {
      total: tickets.length,
      // Tickets avec statut VALID
      valid: tickets.filter((t) => t.status === 'VALID').length,
      // Tickets avec statut USED
      used: tickets.filter((t) => t.status === 'USED').length,
      // Tickets avec statut CANCELLED
      cancelled: tickets.filter((t) => t.status === 'CANCELLED').length,
    };
  }, [tickets]);
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-brand animate-spin" />
        <p className="mt-4 font-title text-muted text-sm tracking-wide">
          CHARGEMENT DE VOS BILLETS...
        </p>
      </div>
    );
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec filtres */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div className="border-l-4 border-brand pl-6">
              <h1 className="font-title text-3xl md:text-4xl font-black text-title uppercase tracking-tight">
                Mes Billets
              </h1>
              <p className="text-muted mt-2 text-sm md:text-base">
                Gérez vos{' '}
                <span className="text-brand font-bold">{stats.total}</span>{' '}
                billets pour{' '}
                <span className="text-brand font-bold">
                  {Object.keys(groupedByEvent).length}
                </span>{' '}
                événement{Object.keys(groupedByEvent).length > 1 ? 's' : ''}
              </p>
            </div>

            {/* Boutons de filtres */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-muted" />
              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.slice(1).map((filter) => {
                  const count =
                    filter.value === 'valid'
                      ? stats.valid
                      : filter.value === 'used'
                        ? stats.used
                        : stats.cancelled;

                  return (
                    <button
                      key={filter.value}
                      onClick={() => setActiveFilter(filter.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 border-2 ${
                        filter.value === 'valid'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                          : filter.value === 'used'
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                            : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                      } active:scale-95`}
                    >
                      {filter.icon}
                      <span className="hidden sm:inline">{filter.label}</span>
                      <span className="bg-current/20 text-current px-2 py-0.5 rounded-full text-xs font-black">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {/* Liste des événements */}
        <div className="space-y-6">
          {Object.values(groupedByEvent).map(
            ({ event, tickets: eventTickets }) => (
              <EventCard
                key={event.id}
                event={event}
                tickets={eventTickets}
                userId={userId ?? ''}
              />
            ),
          )}

          {tickets.length === 0 && (
            <div className="text-center py-20 bg-surface rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/10 flex items-center justify-center">
                <Ticket size={48} className="text-muted" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Aucun billet
              </h3>
              <p className="text-muted mb-6">
                Vous n&apos;avez pas encore acheté de billets
              </p>
              <Button className="bg-brand text-white hover:bg-brand/90">
                Explorer les événements
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de filtres */}
      <FilterModal
        isOpen={activeFilter !== null}
        onClose={() => setActiveFilter(null)}
        tickets={tickets}
        filterType={activeFilter || 'all'}
      />
    </div>
  );
};

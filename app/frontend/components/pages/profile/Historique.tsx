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
// Import des icônes Lucide
import {
  MapPin,
  Calendar,
  Ticket,
  ChevronDown,
  ChevronUp,
  Printer,
  Loader2,
  Tag,
} from 'lucide-react';
const ticketService = new TicketRepository();
const service = new TicketService(ticketService);
const PREVIEW_COUNT = 3;

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
      status === 'VALID'
        ? 'bg-green-50 text-green-700 border-green-200'
        : 'bg-red-50 text-red-600 border-red-200'
    }`}
  >
    {status}
  </span>
);
const TicketRow = ({ t }: { t: HistoriqueTicketDto }) => (
  <div className="flex items-center justify-between px-3 py-2.5 bg-background border border-gray-100 dark:border-gray-800 rounded-xl hover:border-brand/30 transition-colors">
    <div className="flex items-center gap-3">
      <div className="bg-brand/10 p-1.5 rounded-lg">
        <Ticket size={14} className="text-brand" />
      </div>
      <div>
        <p className="font-mono text-xs font-black text-foreground">{t.code}</p>
        <p className="text-[10px] text-muted flex items-center gap-1">
          {t.ticketType.name} •{' '}
          {new Date(t.createdAt).toLocaleDateString('fr-FR')}
        </p>
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
  // AJOUT : État de chargement
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      await service.printTickets(userId, event.id);
      // Optionnel : Notification de succès (toast)
    } catch (error) {
      console.error('Erreur impression:', error);
      alert('Impossible de générer les tickets pour le moment.');
    } finally {
      setIsPrinting(false);
    }
  };
  const visible = expanded ? tickets : tickets.slice(0, PREVIEW_COUNT);
  const hiddenCount = tickets.length - PREVIEW_COUNT;
  return (
    <div className="bg-surface rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row">
        {/* Bannière avec Overlay d'info */}
        <div className="relative sm:w-64 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            sizes="(max-width: 640px) 100vw, 256px"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
          {/* Dégradé sombre pour le texte */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <span className="absolute top-3 left-3 bg-brand/90 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg flex items-center gap-1">
            <Tag size={10} /> Événement
          </span>
          {/* Zone de texte avec fond flouté/couleur */}
          <div className="absolute bottom-3 left-3 right-3 z-10 p-3 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10">
            <h2 className="font-title text-sm font-bold text-white leading-tight mb-2">
              {event.title}
            </h2>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-[10px] text-white/90">
                <MapPin size={12} className="text-brand" />
                <span className="truncate">{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-white/90">
                <Calendar size={12} className="text-brand" />
                <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Contenu Droite */}
        <div className="flex-1 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-title text-[11px] font-bold text-muted uppercase tracking-widest flex items-center gap-2">
              <Ticket size={14} /> Billets réservés
            </h3>
            <span className="bg-brand/10 text-brand text-[10px] font-black px-2.5 py-1 rounded-lg">
              {tickets.length} AU TOTAL
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {visible.map((t, i) => (
              <TicketRow key={i} t={t} />
            ))}

            {tickets.length > PREVIEW_COUNT && (
              <button
                onClick={() => setExpanded((p) => !p)}
                className="group w-full mt-1 py-2 text-[11px] font-bold text-brand border border-dashed border-brand/30 rounded-xl bg-brand/5 hover:bg-brand/10 transition-all flex items-center justify-center gap-2"
              >
                {expanded ? (
                  <>
                    {' '}
                    <ChevronUp size={14} /> Voir moins{' '}
                  </>
                ) : (
                  <>
                    {' '}
                    <ChevronDown size={14} /> +{hiddenCount} autres tickets{' '}
                  </>
                )}
              </button>
            )}
          </div>
          <div className="pt-4 mt-auto gap-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <p className="text-[10px] text-muted italic">
              Veuillez présenter votre code numérique à l&apos;entrée.
            </p>
            <button
              onClick={handlePrint}
              disabled={isPrinting} // Empêche le double clic
              className={`flex items-center gap-2 font-title text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg 
        ${
          isPrinting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-emerald-900/10'
        }`}
            >
              {isPrinting ? (
                <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Printer size={14} />
              )}
              {isPrinting ? 'Génération...' : 'Imprimer tout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export const TicketHistoryPage = () => {
  const [tickets, setTickets] = useState<HistoriqueTicketDto[]>([]);
  const [loading, setLoading] = useState(true);
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
        if (!acc[eventId]) acc[eventId] = { event: ticket.event, tickets: [] };
        acc[eventId].tickets.push(ticket);
        return acc;
      },
      {} as Record<string, { event: EventDto; tickets: HistoriqueTicketDto[] }>,
    );
  }, [tickets]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
        <p className="mt-3 font-title text-muted text-sm tracking-wide">
          SÉCURISATION DE VOS BILLETS...
        </p>
      </div>
    );
  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10 pl-5 border-l-4 border-brand">
        <h1 className="font-title text-3xl font-bold text-title uppercase tracking-tighter">
          Historique des Tickets
        </h1>
        <p className="text-muted mt-1 text-sm">
          Gérez vos accès pour vos{' '}
          <span className="text-brand font-bold">
            {Object.keys(groupedByEvent).length}
          </span>{' '}
          événements à venir.
        </p>
      </header>
      <div className="flex flex-col gap-6">
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
        {tickets.length === 0 && !loading && (
          <div className="text-center py-20 bg-surface rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
            <Ticket size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-muted font-title">
              Vous n&apos;avez pas encore acheté de tickets.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

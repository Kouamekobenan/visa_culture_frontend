'use client';
import { EventService } from '@/app/frontend/module/event/application/event.service';
import { Event } from '@/app/frontend/module/event/domain/entities/event.entity';
import { EventRepository } from '@/app/frontend/module/event/infrastructure/event.repository';
import {
  daysUntil,
  formatFullDateTime,
  isFutureDate,
  isToday,
} from '@/app/frontend/utils/types/conversion.data';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../../ui/Button';
import { NAME } from '@/app/frontend/utils/types/manager.type';
import {
  MapPin,
  Search,
  CalendarDays,
  Ticket,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';
import Link from 'next/link';

const eventRepo = new EventRepository();
const LIMIT = 20;

function getPaginationRange(
  currentPage: number,
  totalPages: number,
): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [
      1,
      '...',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
}

export default function EventPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState<string>(''); // ← AJOUT

  const fetchData = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const res = await eventRepo.getAllEventActivate(LIMIT, page);
      setEvents(res.data);
      setPagination({
        page: res.page,
        totalPages: res.totalPages,
        total: res.total,
      });
    } catch (err: unknown) {
      setError('Erreur lors de la récupération des événements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchData(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const paginationRange = getPaginationRange(
    pagination.page,
    pagination.totalPages,
  );
  // ← AJOUT : filtre côté client par titre
  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  if (error)
    return (
      <div className="p-4 text-error bg-error/10 rounded-lg text-center font-sans font-medium">
        {error}
      </div>
    );
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-sans bg-background text-foreground transition-colors">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-title uppercase tracking-tight">
            Vos Événements
          </h1>
          <p className="text-muted mt-2 text-lg">
            Vivez votre meilleure Coupe du Monde avec {NAME}.
          </p>
        </div>
        {/* Barre de recherche */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted h-4 w-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher un événement..."
            value={searchQuery} // ← AJOUT
            onChange={(e) => setSearchQuery(e.target.value)} // ← AJOUT
            className="w-full pl-11 pr-5 py-3 rounded-full bg-surface border border-muted/20 focus:outline-none focus:ring-2 focus:ring-brand transition-all text-foreground"
          />
        </div>
      </div>
      {/* Compteur de résultats */}
      {!loading && (
        <p className="text-muted text-sm mb-6">
          Plus de {filteredEvents.length} événement
          {filteredEvents.length > 1 ? 's' : ''} à votre disposition{' '}
          {/* ← MODIFIÉ */}
        </p>
      )}
      {/* Grille des événements */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((e) => (
            <div
              key={e.id}
              className="group relative bg-surface rounded-[1.5rem] overflow-hidden border border-muted/10 hover:shadow-xl hover:shadow-brand/10
               transition-all duration-500 flex flex-col h-full"
            >
              {/* Badge Image */}
              <Link
                href={`/frontend/page/details/${e.id}`}
                className="relative h-64 w-full overflow-hidden block"
              >
                <Image
                  src={e.imageUrl ?? '/placeholder.jpg'}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={e.title}
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Status Badge */}
                <div className="absolute top-5 right-5 flex items-center gap-2 bg-background/90 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-title shadow-2xl border border-white/10">
                  <span
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      isFutureDate(e.date) || isToday(e.date)
                        ? 'bg-emerald-500'
                        : 'bg-red-500'
                    }`}
                  />
                  {isToday(e.date)
                    ? "Aujourd'hui"
                    : isFutureDate(e.date)
                      ? `J-${daysUntil(e.date)}`
                      : 'Terminé'}
                </div>
              </Link>
              {/* Contenu de la carte */}
              <div className="p-5 flex flex-col flex-grow relative">
                {/* Organizer Info */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center">
                    <Users size={12} className="text-brand" />
                  </div>
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider truncate">
                    {e.organizer?.name || 'Visa For Culture'}
                  </span>
                </div>
                <h3 className="text-2xl font-black font-title mb-4 leading-tight group-hover:text-brand transition-colors duration-300 line-clamp-2">
                  {e.title}
                </h3>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-muted/80 text-xs font-bold">
                    <div className="w-8 h-8 rounded-xl bg-muted/5 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-brand" />
                    </div>
                    <span className="truncate">{e.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted/80 text-xs font-bold">
                    <div className="w-8 h-8 rounded-xl bg-muted/5 flex items-center justify-center shrink-0">
                      <CalendarDays className="h-4 w-4 text-brand" />
                    </div>
                    {formatFullDateTime(e.date)}
                  </div>
                </div>
                {/* Description */}
                <p className="hidden md:block text-muted/70 text-sm line-clamp-2 mb-4 flex-grow leading-relaxed">
                  {e.description}
                </p>
                {/* Footer Actions */}
                <div className="pt-2 border-t border-muted/10 flex items-center justify-between mt-auto">
                  <Link
                    href={`/frontend/page/details/${e.id}`}
                    className="group/link flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-brand transition-all"
                  >
                    Détails
                    <ChevronRight
                      size={14}
                      className="group-hover/link:translate-x-1 transition-transform"
                    />
                  </Link>

                  {isFutureDate(e.date) || isToday(e.date) ? (
                    <Link href={`/frontend/page/tickets/${e.id}`}>
                      <Button className=" font-black text-xs uppercase tracking-widest shadow-xl shadow-brand/20 hover:shadow-brand/40 hover:scale-[1.02] active:scale-95 transition-all">
                        <Ticket className="h-4 w-4 mr-2" />
                        Réserver
                      </Button>
                    </Link>
                  ) : (
                    <div className="px-4 py-2 rounded-xl bg-muted/10 text-[10px] font-black uppercase tracking-widest text-muted/50">
                      Événement Passé
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-12">
          {/* Bouton Précédent */}
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-muted/20 bg-surface text-muted text-sm font-medium hover:border-brand hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-muted/20 disabled:hover:text-muted transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Précédent</span>
          </button>
          {/* Numéros de pages */}
          <div className="flex items-center gap-1">
            {paginationRange.map((item, index) =>
              item === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="w-9 h-9 flex items-center justify-center text-muted text-sm select-none"
                >
                  ···
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => handlePageChange(item as number)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                    pagination.page === item
                      ? 'bg-brand text-white shadow-lg shadow-brand/30'
                      : 'bg-surface border border-muted/20 text-muted hover:border-brand hover:text-brand'
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>
          {/* Bouton Suivant */}
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-muted/20 bg-surface text-muted text-sm font-medium hover:border-brand hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-muted/20 disabled:hover:text-muted transition-all"
          >
            <span className="hidden sm:inline">Suivant</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

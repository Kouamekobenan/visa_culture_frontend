'use client';
import { EventService } from '@/app/frontend/module/event/application/event.service';
import { Event } from '@/app/frontend/module/event/domain/entities/event.entity';
import { EventRepository } from '@/app/frontend/module/event/infrastructure/event.repository';
import {
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
  CalendarDays,
  Loader2,
  ChevronLeft,
  ChevronRight,
  History, // Icône plus adaptée pour le passé
} from 'lucide-react';
import Link from 'next/link';

const eventRepo = new EventRepository();
const serviceEvent = new EventService(eventRepo);
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

// ... (Fonction getPaginationRange inchangée)


export default function PastEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const paginationRange = getPaginationRange(
    pagination.page,
    pagination.totalPages,
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchData = useCallback(async (page: number) => {
    try {
      setLoading(true);
      // Note: Idéalement, ton service devrait avoir une méthode .findPast()
      // pour éviter de charger des événements futurs inutilement.
      const res = await serviceEvent.findAll(LIMIT, page);

      // FILTRE : On ne garde que les événements qui ne sont PAS dans le futur et PAS aujourd'hui
      const pastEvents = res.data.filter(
        (e) => !isFutureDate(e.date) && !isToday(e.date),
      );

      setEvents(pastEvents);
      setPagination({
        page: res.page,
        totalPages: res.totalPages,
        total: res.total,
      });
    } catch (err: unknown) {
      setError('Erreur lors de la récupération des archives');
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

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (error)
    return (
      <div className="p-4 text-error bg-error/10 rounded-lg text-center">
        {error}
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-sans bg-background text-foreground transition-colors">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <History className="h-8 w-8 text-brand" />
            <h1 className="text-4xl md:text-5xl font-bold text-title uppercase tracking-tight">
              Archives
            </h1>
          </div>
          <p className="text-muted text-lg">
            Revivez les moments forts des événements passés de {NAME}.
          </p>
        </div>

        {/* Barre de recherche (Optionnelle mais utile) */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Rechercher dans l'archive..."
            className="w-full pl-4 pr-4 py-2 rounded-xl border border-muted/20 bg-surface focus:border-brand outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {!loading && (
        <p className="text-muted text-sm mb-6">
          {filteredEvents.length} souvenir{filteredEvents.length > 1 ? 's' : ''}{' '}
          trouvé{filteredEvents.length > 1 ? 's' : ''}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((e) => (
            <div
              key={e.id}
              className="group bg-surface rounded-2xl overflow-hidden border border-muted/10 grayscale hover:grayscale-0 transition-all duration-500 flex flex-col"
            >
              <Link
                href={`/frontend/page/details/${e.id}`}
                className="relative h-56 w-full overflow-hidden block"
              >
                <Image
                  src={e.imageUrl ?? '/placeholder.jpg'}
                  fill
                  className="object-cover"
                  alt={e.title}
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white">
                  Événement terminé
                </div>
              </Link>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold mb-2 leading-tight text-title/80 group-hover:text-brand transition-colors">
                  {e.title}
                </h3>

                <div className="flex items-center gap-1.5 text-muted text-sm mb-2">
                  <MapPin className="h-4 w-4 text-muted/60 shrink-0" />
                  <span className="truncate">{e.location}</span>
                </div>

                <div className="flex items-center mb-6 gap-1.5 text-xs font-bold text-muted">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatFullDateTime(e.date)}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-muted/10 mt-auto">
                  <Link
                    href={`/frontend/page/details/${e.id}`}
                    className="text-muted font-bold text-sm hover:text-brand transition-all"
                  >
                    Voir le récapitulatif
                  </Link>
                  <span className="text-[10px] uppercase tracking-widest text-muted font-black bg-muted/10 px-3 py-1 rounded-full">
                    Terminé
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination (inchangée) */}
      {/* ... */}
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

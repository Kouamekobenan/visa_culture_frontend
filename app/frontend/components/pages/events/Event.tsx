"use client"
import { EventService } from "@/app/frontend/module/event/application/event.service";
import { Event } from "@/app/frontend/module/event/domain/entities/event.entity"
import { EventRepository } from "@/app/frontend/module/event/infrastructure/event.repository";
import { formatShortDate } from "@/app/frontend/utils/types/conversion.data";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react"
import { Button } from "../../ui/Button";
import { NAME } from "@/app/frontend/utils/types/manager.type";
import { MapPin, Search, CalendarDays, Ticket, ArrowRight, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const eventRepo = new EventRepository()
const serviceEvent = new EventService(eventRepo)

const LIMIT = 20;

function getPaginationRange(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export default function EventPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [searchQuery, setSearchQuery] = useState<string>(""); // ← AJOUT

  const fetchData = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const res = await serviceEvent.findAll(LIMIT, page);
      setEvents(res.data);
      setPagination({
        page: res.page,
        totalPages: res.totalPages,
        total: res.total,
      });
    } catch (err:unknown) {
      setError("Erreur lors de la récupération des événements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchData(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const paginationRange = getPaginationRange(pagination.page, pagination.totalPages);

  // ← AJOUT : filtre côté client par titre
  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) return (
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
            onChange={e => setSearchQuery(e.target.value)} // ← AJOUT
            className="w-full pl-11 pr-5 py-3 rounded-full bg-surface border border-muted/20 focus:outline-none focus:ring-2 focus:ring-brand transition-all text-foreground"
          />
        </div>
      </div>
      {/* Compteur de résultats */}
      {!loading && (
        <p className="text-muted text-sm mb-6">
          Plus de  {filteredEvents.length} événement{filteredEvents.length > 1 ? "s" : ""} à votre disposition  {/* ← MODIFIÉ */}
        </p>
      )}

      {/* Grille des événements */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((e) => ( // ← MODIFIÉ : filteredEvents au lieu de events
            <div
              key={e.id}
              className="group bg-surface rounded-2xl overflow-hidden border border-muted/10 hover:shadow-xl hover:shadow-brand/5 transition-all duration-300 flex flex-col"
            >
              {/* Image cliquable → page détail */}
              <Link
                href={`/frontend/page/details/${e.id}`}
                className="relative h-56 w-full overflow-hidden block"
              >
                <Image
                  src={e.imageUrl ?? "/placeholder.jpg"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  alt={e.title}
                />
                {/* Overlay au hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-title">
                  <CalendarDays className="h-3.5 w-3.5 text-brand" />
                  {formatShortDate(e.date)}
                </div>
              </Link>
              {/* Contenu de la carte */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold mb-2 leading-tight">
                  {e.title}
                </h3>

                <div className="flex items-center gap-1.5 text-muted text-sm mb-4">
                  <MapPin className="h-4 w-4 text-brand shrink-0" />
                  <span className="truncate">{e.location}</span>
                </div>

                {/* Description masquée sur mobile */}
                <p className="hidden md:block text-muted text-sm line-clamp-3 mb-6 flex-grow">
                  {e.description}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-muted/10 mt-auto">
                  <Link
                    href={`/frontend/page/details/${e.id}`}
                    className="flex items-center gap-1 text-brand font-bold text-sm hover:underline underline-offset-4 transition-all"
                  >
                    Voir plus
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Button
                    className="flex items-center gap-2 bg-btn hover:opacity-90 text-white font-bold px-5 py-2 rounded-xl transition-all active:scale-95 shadow-lg shadow-btn/20"
                  >
                    <Ticket className="h-4 w-4" />
                    Acheter
                  </Button>
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
              item === "..." ? (
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
                      ? "bg-brand text-white shadow-lg shadow-brand/30"
                      : "bg-surface border border-muted/20 text-muted hover:border-brand hover:text-brand"
                  }`}
                >
                  {item}
                </button>
              )
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
  )
}
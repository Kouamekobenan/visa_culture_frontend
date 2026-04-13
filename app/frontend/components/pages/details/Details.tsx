"use client"

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Event } from "@/app/frontend/module/event/domain/entities/event.entity";
import { EventRepository } from "@/app/frontend/module/event/infrastructure/event.repository";
import { EventService } from "@/app/frontend/module/event/application/event.service";
import { formatFullDateTime } from "@/app/frontend/utils/types/conversion.data";
import Image from "next/image";
import { Calendar, MapPin, User, ArrowLeft, Ticket, Share2 } from "lucide-react";
import { Button } from "../../ui/Button";
import Link from "next/link";

const eventRepo = new EventRepository();
const eventService = new EventService(eventRepo);

export default function EventDetail() {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false); // Pour le "Lire la suite"

  const params = useParams();
  const eventId = params?.id as string;

  const fetchEventData = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await eventService.findOne(eventId);
      if (res) setEvent(res);
      else setError("Événement introuvable");
    } catch (err) {
      setError("Erreur lors du chargement de l'événement.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { fetchEventData(); }, [fetchEventData]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand"></div>
      <p className="text-muted font-medium animate-pulse">Préparation de votre expérience...</p>
    </div>
  );

  if (error || !event) return (
    <div className="max-w-md mx-auto my-20 p-6 bg-error/5 border border-error/20 rounded-2xl text-center">
      <p className="text-error font-bold mb-4">{error || "Événement introuvable"}</p>
      <Link href="/frontend/page/event">
        <Button variant="outline">Retour aux événements</Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors pb-20">
      {/* ── BANNIÈRE HÉROS ── */}
      <div className="relative h-[40vh] md:h-[60vh] w-full">
        <Image 
          src={event.imageUrl} 
          fill 
          className="object-cover" 
          alt={event.title} 
          priority
        />
        {/* Overlay dégradé pour la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Bouton retour */}
        <Link href="/frontend/page/event" className="absolute top-6 left-6">
          <button className="p-3 rounded-full bg-background/80 backdrop-blur-md border border-muted/20 hover:scale-110 transition-all">
            <ArrowLeft size={20} />
          </button>
        </Link>
      </div>
      {/* ── CONTENU PRINCIPAL ── */}
      <div className="max-w-5xl mx-auto px-6 -mt-32 relative z-10">
        <div className="bg-surface border border-muted/10 rounded-3xl p-6 md:p-10 shadow-2xl shadow-brand/5">
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-6xl font-bold font-title text-title uppercase leading-tight tracking-tighter mb-6">
                {event.title}
              </h1>
              {/* Infos Clés */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex flex-col items-center gap-3 p-3 rounded-xl bg-background/50 border border-muted/5">
                  <div className="p-2 rounded-lg bg-brand/10 text-brand">
                    <Calendar size={20} />
                  </div>
                  <div>
                    {/* <p className="text-xs text-muted uppercase font-bold tracking-wider">Date & Heure</p> */}
                    <p className="text-sm font-semibold">{formatFullDateTime(event.date)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3 p-3 rounded-xl bg-background/50 border border-muted/5">
                  <div className="p-2 rounded-lg bg-brand/10 text-brand">
                    <MapPin size={20} />
                  </div>
                  <div>
                    {/* <p className="text-xs text-muted uppercase font-bold tracking-wider">Lieu</p> */}
                    <p className="text-sm font-semibold">{event.location}</p>
                  </div>
                </div>
              </div>
              {/* Description avec "Lire la suite" */}
              <div className="relative">
                <h2 className="text-xl font-bold font-title mb-3">À propos de l&apos;événement</h2>
                <p className={`text-muted leading-relaxed transition-all duration-300 ${!isExpanded ? "line-clamp-4" : ""}`}>
                  {event.description}
                </p>
                {event.description.length > 200 && (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 text-brand font-bold text-sm hover:underline underline-offset-4"
                  >
                    {isExpanded ? "Réduire" : "Lire la suite..."}
                  </button>
                )}
              </div>
            </div>
            {/* Sidebar d'achat (Sticky sur Desktop) */}
            <div className="w-full md:w-80 space-y-4">
              <div className="p-6 rounded-2xl bg-brand/5 border border-brand/20 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted font-medium">Organisé par</span>
                  <div className="flex items-center gap-1 text-foreground font-bold italic">
                    <User size={14} className="text-brand" />
                    {event.organizer ? event.organizer.name : event.organizerId.substring(0, 8) + "..."}
                  </div>
                </div>
                <Button className="w-full bg-btn hover:scale-105 transition-transform py-6 text-lg font-bold shadow-xl shadow-btn/20 flex gap-2">
                  <Ticket size={20} />
                  Réserver ma place
                </Button>
                <button className="flex items-center justify-center gap-2 text-sm text-muted hover:text-foreground transition-colors">
                  <Share2 size={16} /> Partager l&apos;événement
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
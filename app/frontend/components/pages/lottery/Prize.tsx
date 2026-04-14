'use client';

import { EventService } from '@/app/frontend/module/event/application/event.service';
import { EventRepository } from '@/app/frontend/module/event/infrastructure/event.repository';
import { Lottery as LotteryType } from '@/app/frontend/utils/types/manager.type';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Gift, Sparkles, Trophy } from 'lucide-react';

const eventService = new EventService(new EventRepository());

export default function LotterySection({ eventId }: { eventId: string }) {
  const [prizes, setPrizes] = useState<LotteryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await eventService.findPrizeEvent(eventId);
        console.log('data', res);
        // On s'assure de récupérer le tableau de données
        setPrizes(res);
      } catch (error) {
        console.error('Erreur lors de la récupération des prix');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  if (loading) return null; // Ou un skeleton

  return (
    <section className="py-12 px-4 space-y-10">
      {/* HEADER AVEC ANIMATION */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-title/10 text-title font-bold text-sm animate-bounce">
          <Sparkles size={16} />
          <span>Tentez votre chance !</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold leading-tight">
          Des lots <span className="text-title">exceptionnels</span> à gagner
        </h2>
        <p className="text-muted font-sans italic">
          Chaque ticket acheté est une chance supplémentaire de repartir avec
          l&apos;un de ces prix prestigieux.
        </p>
      </div>

      {/* GRILLE DES PRIX */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {prizes?.map((p, index) => (
          <div
            key={p.id}
            className="group relative bg-surface rounded-[2rem] p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand/20 border border-muted/5 overflow-hidden"
            style={{ transitionDelay: `${index * 100}ms` }} // Animation en cascade
          >
            {/* Effet de brillance en arrière-plan au hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 space-y-5">
              {/* Badge Top Prize */}
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-background shadow-inner">
                  <Trophy className="text-title" size={24} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-muted/50">
                  Lot n°{index + 1}
                </span>
              </div>

              {/* IMAGE DU PRIX */}
              {/* IMAGE DU PRIX */}
              <div className="relative h-56 w-full rounded-2xl overflow-hidden shadow-lg border-4 border-white transform group-hover:scale-105 transition-transform duration-500 bg-surface">
                {p.prizes.imageUrl ? (
                  <Image
                    src={p.prizes.imageUrl}
                    fill
                    className="object-cover"
                    alt={p.prizes.title}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted/10">
                    <Trophy className="text-muted/20" size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* TEXTE */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold group-hover:text-brand transition-colors">
                  {p.prizes.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed line-clamp-2">
                  {p.prizes.description}
                </p>
              </div>

              {/* FOOTER DE CARTE */}
              <div className="pt-4 border-t border-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-btn font-bold">
                  <Gift size={18} />
                  <span className="text-sm">Disponible</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-brand animate-ping" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

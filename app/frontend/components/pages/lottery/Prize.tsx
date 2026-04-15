'use client';

import { EventService } from '@/app/frontend/module/event/application/event.service';
import { EventRepository } from '@/app/frontend/module/event/infrastructure/event.repository';
import { Lottery as LotteryType } from '@/app/frontend/utils/types/manager.type';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Sparkles, Trophy } from 'lucide-react';

const eventService = new EventService(new EventRepository());

export default function LotterySection({ eventId }: { eventId: string }) {
  const [prizes, setPrizes] = useState<LotteryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await eventService.findPrizeEvent(eventId);
        setPrizes(res);
      } catch (error) {
        console.error('Erreur lors de la récupération des prix');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);
  if (loading) return null;
  const allPrizes = prizes.flatMap((lottery) =>
    lottery.prizes.map((prize) => ({ ...prize })),
  );

  return (
    <section className="py-12 px-4 space-y-10">
      {/* HEADER AMÉLIORÉ */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-title/10 text-title font-extrabold text-base md:text-lg animate-pulse border border-title/20 shadow-sm">
          <Sparkles className="text-brand" size={20} />
          <span>
            Félicitations ! Votre ticket vous rend éligible pour ces prix
            exclusifs.
          </span>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            Des lots <span className="text-title">exceptionnels</span> à gagner
          </h2>
          <p className="text-muted text-lg font-medium">
            Gardez précieusement votre ticket. Les résultats seront bientôt
            disponibles directement sur votre tableau de bord.
          </p>
        </div>
      </div>
      {/* GRILLE DES PRIX */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {allPrizes.map((prize, index) => (
          <div
            key={prize.id}
            className="group relative bg-surface rounded-[2rem] p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand/20 border border-muted/5 overflow-hidden"
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 space-y-5">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-background shadow-inner">
                  <Trophy className="text-brand" size={24} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-muted/50">
                  Lot n°{index + 1}
                </span>
              </div>
              <div className="relative h-56 w-full rounded-2xl overflow-hidden shadow-lg border-4 border-white transform group-hover:scale-105 transition-transform duration-500 bg-surface">
                {prize.imageUrl ? (
                  <Image
                    src={prize.imageUrl}
                    fill
                    className="object-cover"
                    alt={prize.title}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted/10">
                    <Trophy className="text-muted/20" size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold group-hover:text-brand transition-colors">
                  {prize.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed line-clamp-2">
                  {prize.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

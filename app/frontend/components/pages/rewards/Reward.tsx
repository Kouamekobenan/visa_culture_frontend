'use client';

import { useAuth } from '@/app/frontend/context/useContext';
import { Button } from '../../ui/Button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { WinnersUserDto } from '@/app/frontend/module/draws/domains/entities/draws.entity';
import { DrawRepository } from '@/app/frontend/module/draws/infrastructure/draws.repository';
import Image from 'next/image';
import { Trophy, Ticket, Calendar, Lock } from 'lucide-react';

const drawRepository = new DrawRepository();

export default function Reward() {
  const [winners, setWinners] = useState<WinnersUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !userId) return;
      try {
        setLoading(true);
        const res = await drawRepository.findAllUserWinner(userId);
        setWinners(res);
      } catch (error) {
        console.error('Error to retrieve data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, userId]);

  // ÉTAT : NON CONNECTÉ
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-surface rounded-3xl border-2 border-dashed border-muted/20">
        <div className="w-20 h-20 bg-muted/10 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-muted" />
        </div>
        <h2 className="text-2xl font-title font-bold mb-2">Espace réservé</h2>
        <p className="text-muted mb-8 max-w-xs">
          Connectez-vous pour consulter vos récompenses et vos gains de tombola.
        </p>
        <Link href="/frontend/page/login">
          <Button className="bg-brand hover:opacity-90 px-8 py-6 rounded-2xl shadow-lg shadow-brand/20 transition-all">
            Se connecter maintenant
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-2">
            Vos <span className="text-title">Récompenses</span>
          </h1>
          <p className="text-muted font-medium">
            Retrouvez ici tous les lots que vous avez remportés.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand rounded-full text-sm font-bold">
          <Trophy className="w-4 h-4" />
          <span>{winners.length} Victoires</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-64 bg-surface animate-pulse rounded-3xl"
            />
          ))}
        </div>
      ) : winners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {winners.map((d) => (
            <div
              key={d.id}
              className="group relative bg-surface border border-muted/10 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-brand/10 hover:-translate-y-2 transition-all duration-500"
            >
              {/* IMAGE DU PRIX */}
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src={d.imageUrl}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={d.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />

                {/* BADGE NUMÉRO GAGNANT */}
                <div className="absolute top-4 left-4">
                  {d.drawWinners.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xl"
                    >
                      <Ticket className="w-4 h-4 text-brand" />
                      <span className="text-xs font-bold font-title">
                        N° {w.entry.luckyNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CONTENU DU PRIX */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-brand transition-colors">
                  {d.title}
                </h3>
                <p className="text-muted text-sm line-clamp-2 mb-6">
                  {d.description ||
                    'Félicitations ! Vous avez remporté ce lot lors de notre dernier tirage au sort.'}
                </p>

                {/* SECTION ÉVÉNEMENT (EN BAS) */}
                <div className="pt-6 border-t border-muted/10">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-muted/20">
                      <Image
                        src={d.lottery.event.imageUrl}
                        fill
                        className="object-cover"
                        alt={d.lottery.event.title}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-muted font-bold">
                        Événement
                      </p>
                      <p className="text-sm font-bold truncate text-foreground">
                        {d.lottery.event.title}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* EMPTY STATE GAGNANT */
        <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-[3rem] border-2 border-dashed border-muted/20">
          <div className="relative mb-6">
            <Trophy className="w-20 h-20 text-muted/20" />
            <div className="absolute -bottom-2 -right-2 bg-background p-2 rounded-full border border-muted/10">
              <Calendar className="w-6 h-6 text-brand" />
            </div>
          </div>
          <p className="text-xl font-title font-bold">Pas encore de gains</p>
          <p className="text-muted mb-8 text-center max-w-xs mt-2">
            Participez à nos prochains événements pour tenter de gagner des lots
            exceptionnels !
          </p>
          <Link href="/frontend/page/event">
            <Button className="bg-btn hover:opacity-90 rounded-xl px-6">
              Voir les événements
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

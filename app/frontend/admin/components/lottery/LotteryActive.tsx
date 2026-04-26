'use client';

import { DrawsWinners } from '@/app/frontend/components/pages/draws/DrawWinner';
import { Button } from '@/app/frontend/components/ui/Button';
import { LotteryService } from '@/app/frontend/module/lotteries/application/lottery.service';
import { Lottery } from '@/app/frontend/module/lotteries/domain/entities/lottery.entity';
import { LotteryRepository } from '@/app/frontend/module/lotteries/infrastructure/lottery.entity';
import { DrawRepository } from '@/app/frontend/module/draws/infrastructure/draws.repository';
import { formatShortDate } from '@/app/frontend/utils/types/conversion.data';
import { PaginatedResponseRepository } from '@/app/frontend/utils/types/manager.type';
import { CalendarDays, Star, Ticket } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { LotteryVisualizer } from './LotteryVisualizer';
import { toast } from 'react-toastify';
const lotteryRepo = new LotteryRepository();
const lotteryService = new LotteryService(lotteryRepo);
const drawService = new DrawRepository();
const LIMIT = 12;
export default function LotteryPageAdmin() {
  const [lotteries, setLotteries] = useState<
    PaginatedResponseRepository<Lottery> | undefined
  >();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  // ÉTATS POUR LE TIRAGE
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedLottery, setSelectedLottery] = useState<Lottery | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  useEffect(() => {
    const fetchLotteries = async () => {
      setLoading(true);
      try {
        const result = await lotteryService.findAll(LIMIT, page);
        setLotteries(result);
      } catch (error) {
        console.error('Erreur loteries', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLotteries();
  }, [page]);
  const handleInitiateDraw = (lottery: Lottery) => {
    setSelectedLottery(lottery);
    setIsDrawing(true);
    toast.info('Préparation du tirage en cours...');
  };
  const handleFinishDraw = async () => {
    if (selectedLottery) {
      try {
        await toast.promise(
          drawService.save({ lotteryId: selectedLottery.id }),
          {
            pending: 'Enregistrement du résultat...',
            success: 'Tirage validé avec succès ! 🏆',
            error: 'Erreur lors de la validation 🤯',
          },
        );
        setIsDrawing(false);
        setShowWinnerModal(true);
      } catch (error) {
        // alert("Erreur lors de l'enregistrement du tirage");
        toast.error("Échec de l'enregistrement du tirage. Veuillez réessayer.");
        setIsDrawing(false);
      }
    }
  };
  const totalPages = lotteries ? Math.ceil(lotteries.total / LIMIT) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 bg-background">
      {/* ANIMATION DE 30S */}
      {isDrawing && selectedLottery && (
        <LotteryVisualizer
          eventTitle={selectedLottery.event.title}
          onComplete={handleFinishDraw}
        />
      )}
      {/* MODAL GAGNANT (S'affiche après l'animation) */}
      {showWinnerModal && selectedLottery && (
        <DrawsWinners
          lotteryId={selectedLottery.id}
          eventTitle={selectedLottery.event.title}
          onClose={() => {
            setShowWinnerModal(false);
            setSelectedLottery(null);
          }}
        />
      )}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-brand/20 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          Administration
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-title mb-2">
          Gestion des Tirages
        </h1>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-80 bg-muted/10 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lotteries?.data.map((lottery) => (
            <LotteryCard
              key={lottery.id}
              lottery={lottery}
              onLaunch={() => handleInitiateDraw(lottery)}
            />
          ))}
        </div>
      )}
      {/* Pagination (simplifiée pour le code complet) */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          <Button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            variant="outline"
          >
            Précédent
          </Button>
          <Button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            variant="outline"
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}

function LotteryCard({
  lottery,
  onLaunch,
}: {
  lottery: Lottery;
  onLaunch: () => void;
}) {
  const eventDate =
    lottery.event?.date instanceof Date
      ? lottery.event.date.toISOString()
      : (lottery.event?.date ?? new Date().toISOString());

  return (
    <div className="group bg-surface rounded-2xl border border-muted/10 overflow-hidden hover:shadow-2xl transition-all duration-500">
      <div className="p-5">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted mb-4">
          <Star className="h-3 w-3 text-orange-400" />
          Récompenses
        </p>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {lottery.prizes.map((prize, i) => (
            <div key={i} className="flex-shrink-0 w-32">
              <div className="relative h-20 w-full rounded-lg overflow-hidden mb-2 shadow-sm">
                <Image
                  src={prize.imageUrl}
                  fill
                  className="object-cover"
                  alt={prize.title}
                />
              </div>
              <p className="text-[11px] font-bold truncate">{prize.title}</p>
            </div>
          ))}
        </div>

        <div className="my-5 h-px bg-gradient-to-r from-transparent via-muted/20 to-transparent" />

        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-muted/20 shadow-inner">
            <Image
              src={lottery.event.imageUrl}
              fill
              className="object-cover"
              alt={lottery.event.title}
            />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight mb-1">
              {lottery.event.title}
            </h3>
            <p className="text-[11px] text-muted flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {formatShortDate(eventDate)}
            </p>
          </div>
        </div>

        <Button
          onClick={onLaunch}
          className="w-full  hover:bg-brand text-white py-3 rounded-xl transition-all duration-300 group-hover:scale-[1.02]"
        >
          <Ticket className="h-4 w-4 mr-2" />
          Lancer le tirage direct
        </Button>
      </div>
    </div>
  );
}

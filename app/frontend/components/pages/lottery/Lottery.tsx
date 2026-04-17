'use client';

import { LotteryService } from '@/app/frontend/module/lotteries/application/lottery.service';
import { Lottery } from '@/app/frontend/module/lotteries/domain/entities/lottery.entity';
import { LotteryRepository } from '@/app/frontend/module/lotteries/infrastructure/lottery.entity';
import { formatShortDate } from '@/app/frontend/utils/types/conversion.data';
import { PaginatedResponseRepository } from '@/app/frontend/utils/types/manager.type';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Star,
  Ticket,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '../../ui/Button';

const lotteryRepo = new LotteryRepository();
const lotteryService = new LotteryService(lotteryRepo);

const LIMIT = 12;

export default function LotteryPage() {
  const [lotteries, setLotteries] = useState<
    PaginatedResponseRepository<Lottery> | undefined
  >();
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchLotteries = async () => {
      setLoading(true);
      try {
        const result = await lotteryService.findAll(LIMIT, page);
        setLotteries(result);
      } catch (error) {
        console.error('Erreur lors de la récupération des loteries', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLotteries();
  }, [page]);

  const totalPages = lotteries ? Math.ceil(lotteries.total / LIMIT) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-brand/20 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          Tirages en direct
        </span>
        <h1 className="font-title text-3xl md:text-4xl font-bold text-foreground leading-tight mb-2">
          Les tirages <span className="text-title">en cours</span>
        </h1>
        <p className="text-muted text-sm max-w-md mx-auto">
          Achetez votre ticket et rejoignez les participants pour tenter de
          remporter un prix.
        </p>
      </div>

      {/* ── Grille ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl border border-muted/10 h-72 animate-pulse"
            />
          ))}
        </div>
      ) : lotteries?.data.length === 0 ? (
        <div className="text-center py-24 text-muted text-sm">
          <Ticket className="mx-auto mb-3 h-10 w-10 opacity-20" />
          Aucune loterie active pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {lotteries?.data.map((lottery) => (
            <LotteryCard key={lottery.id} lottery={lottery} />
          ))}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-muted/20 bg-surface text-sm font-bold text-foreground hover:border-muted/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Précédent
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                  p === page
                    ? 'bg-brand text-white'
                    : 'border border-muted/20 bg-surface text-foreground hover:border-muted/40'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-muted/20 bg-surface text-sm font-bold text-foreground hover:border-muted/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Suivant
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-muted">
            {lotteries?.total ?? 0} loteries actives · page {page} sur{' '}
            {totalPages}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Sous-composant carte ──────────────────────────────────────── */
function LotteryCard({ lottery }: { lottery: Lottery }) {
  const eventDate =
    lottery.event?.date instanceof Date
      ? lottery.event.date.toISOString()
      : (lottery.event?.date ?? new Date().toISOString());

  return (
    <div className="bg-surface rounded-2xl border border-muted/10 hover:border-brand/20 hover:shadow-lg hover:shadow-brand/5 transition-all duration-300 flex flex-col overflow-hidden">
      {/* ── Prix ──────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-1">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted mb-3">
          <Star className="h-3 w-3 text-title" />
          Prix à remporter
        </p>
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {lottery.prizes.map((prize, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-28 bg-background rounded-xl border border-muted/10 overflow-hidden"
            >
              <div className="relative h-16 w-full">
                <Image
                  src={prize.imageUrl}
                  fill
                  sizes="112px"
                  className="object-cover"
                  alt={prize.title}
                />
              </div>
              <div className="px-2 py-1.5">
                <p className="text-[11px] font-bold text-foreground truncate">
                  {prize.title}
                </p>
                <p className="text-[10px] text-muted line-clamp-2 mt-0.5">
                  {prize.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Séparateur ────────────────────────────────────────── */}
      <div className="mx-4 my-3 h-px bg-muted/10" />

      {/* ── Événement ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pb-4">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-muted/10">
          <Image
            src={lottery.event.imageUrl}
            fill
            sizes="48px"
            className="object-cover"
            alt={lottery.event.title}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-title text-sm font-bold text-foreground truncate">
            {lottery.event.title}
          </p>
          <p className="flex items-center gap-1 text-[11px] text-muted mt-0.5">
            <CalendarDays className="h-3 w-3 text-brand flex-shrink-0" />
            {formatShortDate(eventDate)}
          </p>
        </div>
      </div>

      {/* ── Bouton ────────────────────────────────────────────── */}
      <div className="px-4 pb-4 mt-auto">
        <Link
          href={`/frontend/page/details/${lottery.eventId}`}
          className="block"
        >
          <Button className="w-full flex items-center justify-center gap-2 bg-btn hover:opacity-90 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all active:scale-95">
            <Ticket className="h-4 w-4" />
            Acheter un ticket
          </Button>
        </Link>
      </div>
    </div>
  );
}

'use client';

import { useAuth } from '@/app/frontend/context/useContext';
import { EventService } from '@/app/frontend/module/event/application/event.service';
import { Event } from '@/app/frontend/module/event/domain/entities/event.entity';
import { EventRepository } from '@/app/frontend/module/event/infrastructure/event.repository';
import { TicketService } from '@/app/frontend/module/tickets/application/ticket.service';
import { TicketRepository } from '@/app/frontend/module/tickets/infrastructure/ticket.repository';
import { TicketTypeService } from '@/app/frontend/module/tickets/typesTicket/application/typeTicket.service';
import { TicketType } from '@/app/frontend/module/tickets/typesTicket/domain/entities/ticketType.entity';
import { TicketTypeRepository } from '@/app/frontend/module/tickets/typesTicket/infrastructure/ticketType.repository';
import { formatFullDateTime } from '@/app/frontend/utils/types/conversion.data';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '../../ui/Button';
import Link from 'next/link';
import { TicketCheck, ShoppingCart, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
const ticketTypeService = new TicketTypeService(new TicketTypeRepository());
const serviceTicket = new TicketService(new TicketRepository());
const eventService = new EventService(new EventRepository());
export default function TicketSelection({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [types, setTypes] = useState<TicketType[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const router = useRouter();
  useEffect(() => {
    const loadData = async () => {
      try {
        const [resEvent, resTypes] = await Promise.all([
          eventService.findOne(eventId),
          ticketTypeService.findById(eventId),
        ]);
        setEvent(resEvent);
        // Normalisation défensive : garantit un tableau
        const typesArray: TicketType[] = Array.isArray(resTypes)
          ? resTypes
          : typeof resTypes === 'object' &&
              resTypes !== null &&
              'data' in resTypes &&
              Array.isArray((resTypes as Record<string, unknown>).data)
            ? ((resTypes as Record<string, unknown>).data as TicketType[])
            : [];

        setTypes(typesArray);
        // Initialiser les quantités à 0
        const initialQty: Record<string, number> = {};
        typesArray.forEach((t) => (initialQty[t.id] = 0));
        setQuantities(initialQty);
      } catch (err) {
        console.error('Erreur de chargement', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [eventId]);
  const handleQtyChange = (id: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, val) }));
  };
  const handlePurchase = async (typeId: string) => {
    const qty = quantities[typeId];
    if (qty <= 0) return alert('Choisissez au moins 1 ticket');

    try {
      const res = await serviceTicket.create(
        {
          userId: user!.id,
          eventId: eventId,
          ticketTypeId: typeId,
        },
        qty,
      );
      toast.success('Réservation confirmée !', {
        description: `${qty} ticket(s) — ID: ${res.paymentId}`,
        duration: 4000,
        position: 'top-right',
      });
      router.push(`/frontend/page/lottery/${eventId}`);
    } catch (err) {
      alert("Erreur lors de l'achat");
    }
  };
  if (!user)
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-surface rounded-3xl border border-dashed border-muted">
        <p className="text-muted mb-4 font-sans">
          Connectez-vous pour acheter vos places
        </p>
        <Link href="/frontend/page/login">
          <Button className="bg-brand">Se connecter</Button>
        </Link>
      </div>
    );
  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-brand" />
      </div>
    );
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* HEADER ÉVÉNEMENT */}
      <div className="relative overflow-hidden rounded-3xl bg-foreground text-background p-6 md:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
          <div className="relative w-40 h-40 shrink-0 rounded-2xl overflow-hidden border-4 border-title/20">
            <Image
              src={event?.imageUrl || ''}
              fill
              className="object-cover"
              alt="event"
            />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-bold text-title">
              {event?.title}
            </h1>
            <p className="text-muted flex items-center justify-center md:justify-start gap-2">
              <TicketCheck size={18} /> {formatFullDateTime(event?.date ?? '')}
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
      </div>
      {/* LISTE DES BILLETS */}
      <div className="grid gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 px-2">
          <ShoppingCart className="text-brand" /> Choix des billets
        </h2>

        {types.map((t) => (
          <div
            key={t.id}
            className="group bg-surface hover:bg-white transition-all border border-transparent hover:border-brand/20 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm hover:shadow-md"
          >
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl font-bold">{t.name}</h3>
              <p className="text-2xl font-black text-brand">{t.price} FCFA</p>
            </div>

            <div className="flex items-center gap-4 bg-background p-2 rounded-xl border border-muted/10">
              <div className="flex items-center">
                <label className="sr-only">Quantité</label>
                <input
                  type="number"
                  value={quantities[t.id] || 0}
                  onChange={(e) =>
                    handleQtyChange(t.id, parseInt(e.target.value))
                  }
                  className="w-16 bg-transparent text-center font-bold text-lg outline-none"
                  min="0"
                />
              </div>
              <Button
                onClick={() => handlePurchase(t.id)}
                className="bg-btn hover:scale-105 transition-transform text-white font-bold px-8 shadow-lg shadow-btn/20"
              >
                Acheter
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

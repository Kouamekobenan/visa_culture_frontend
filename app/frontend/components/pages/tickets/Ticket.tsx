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
import {
  TicketCheck,
  ShoppingCart,
  Loader2,
  X,
  Smartphone,
  Banknote,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
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

  // États du tunnel de paiement
  const [selectedTicketType, setSelectedTicketType] =
    useState<TicketType | null>(null);
  const [isPaymentStep, setIsPaymentStep] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    'WAVE' | 'MTN' | 'ORANGE' | 'CASH' | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const loadData = async () => {
      try {
        const [resEvent, resTypes] = await Promise.all([
          eventService.findOne(eventId),
          ticketTypeService.findById(eventId),
        ]);
        setEvent(resEvent);
        const typesArray: TicketType[] = Array.isArray(resTypes)
          ? resTypes
          : [];
        setTypes(typesArray);
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
  const openPaymentModal = (type: TicketType) => {
    if ((quantities[type.id] || 0) <= 0) {
      return toast.error('Veuillez choisir au moins 1 ticket');
    }
    setSelectedTicketType(type);
    setIsPaymentStep(true);
  };
  const handleFinalConfirm = async () => {
    if (!paymentMethod || !selectedTicketType || !user) return;

    setIsProcessing(true);
    const qty = quantities[selectedTicketType.id];

    try {
      // Simulation du délai de transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (!user.name || !user.phone) {
        throw new Error('Informations utilisateur incomplètes');
      }
      await serviceTicket.create(
        {
          userId: user.id,
          eventId: eventId,
          ticketTypeId: selectedTicketType.id,
          buyerName: user.name,
          buyerPhone: user.phone,
        },
        qty,
      );
      toast.success('Félicitations !', {
        description: `Paiement ${paymentMethod} validé pour ${qty} ticket(s).`,
      });
      router.push(`/frontend/page/lottery/${eventId}`);
    } catch (err) {
      toast.error('Échec de la transaction. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };
  if (!user) return <AuthPrompt />;
  if (loading) return <LoadingSpinner />;
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* HEADER ÉVÉNEMENT */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground text-background p-6 md:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
          <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
            <Image
              src={event?.imageUrl || ''}
              fill
              className="object-cover"
              alt="event"
            />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-black text-title tracking-tight leading-none">
              {event?.title}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-3 bg-white/5 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/5">
              <TicketCheck size={18} className="text-brand" />
              <span className="text-sm font-medium">
                {formatFullDateTime(event?.date ?? '')}
              </span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/20 blur-[100px] rounded-full -mr-32 -mt-32"></div>
      </div>
      {/* LISTE DES BILLETS */}
      <div className="grid gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 px-2 font-title italic">
          <ShoppingCart className="text-brand" /> Sélectionner vos places
        </h2>

        {types.map((t) => (
          <div
            key={t.id}
            className="group bg-surface p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm border border-transparent hover:border-brand/20 transition-all duration-300"
          >
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold font-title">{t.name}</h3>
              <p className="text-3xl font-black text-brand tracking-tighter">
                {t.price.toLocaleString()}{' '}
                <span className="text-xs font-normal">FCFA</span>
              </p>
            </div>

            <div className="flex items-center gap-4 bg-background/50 p-2 rounded-2xl border border-muted/10">
              <input
                type="number"
                value={quantities[t.id] || 0}
                onChange={(e) =>
                  handleQtyChange(t.id, parseInt(e.target.value))
                }
                className="w-16 bg-transparent text-center font-black text-xl outline-none"
                min="0"
              />
              <Button
                onClick={() => openPaymentModal(t)}
                className="bg-btn hover:scale-105 px-8 py-6 rounded-xl shadow-xl shadow-btn/20 group"
              >
                Réserver{' '}
                <ChevronRight
                  size={18}
                  className="ml-1 group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE PAIEMENT COMPACTE */}
      {isPaymentStep && selectedTicketType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-background w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[95vh] animate-in slide-in-from-bottom-8 duration-500">
            {/* Header Modal */}
            <div className="p-5 border-b border-muted/10 flex justify-between items-center bg-surface shrink-0">
              <h3 className="font-title font-bold text-lg">Mode de paiement</h3>
              <button
                onClick={() => setIsPaymentStep(false)}
                className="p-2 hover:bg-muted/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            {/* Contenu Scrollable */}
            <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
              {/* Résumé du Panier */}
              <div className="bg-brand/5 p-4 rounded-3xl border border-brand/10 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase text-muted font-black tracking-widest">
                    Total Transaction
                  </p>
                  <p className="text-2xl font-black text-brand tracking-tighter">
                    {(
                      selectedTicketType.price *
                      quantities[selectedTicketType.id]
                    ).toLocaleString()}{' '}
                    <span className="text-xs">FCFA</span>
                  </p>
                </div>
                <div className="text-right text-xs font-bold bg-white/80 dark:bg-black/20 px-3 py-2 rounded-xl border border-brand/5">
                  {quantities[selectedTicketType.id]}x {selectedTicketType.name}
                </div>
              </div>

              {/* Grille des Opérateurs */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] px-1 text-center">
                  Opérateurs disponibles
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <PaymentOptionSmall
                    active={paymentMethod === 'WAVE'}
                    onClick={() => setPaymentMethod('WAVE')}
                    color="bg-blue-500"
                    label="Wave"
                  />
                  <PaymentOptionSmall
                    active={paymentMethod === 'MTN'}
                    onClick={() => setPaymentMethod('MTN')}
                    color="bg-yellow-500"
                    label="MTN"
                  />
                  <PaymentOptionSmall
                    active={paymentMethod === 'ORANGE'}
                    onClick={() => setPaymentMethod('ORANGE')}
                    color="bg-orange-500"
                    label="Orange"
                  />
                  {/* Option Cash / Espèces */}
                  <div
                    onClick={() => setPaymentMethod('CASH')}
                    className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all cursor-pointer gap-2
                      ${paymentMethod === 'CASH' ? 'border-emerald-500 bg-emerald-500/5' : 'border-muted/10 hover:border-emerald-300'}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${paymentMethod === 'CASH' ? 'bg-emerald-500 text-white' : 'bg-muted/10'}`}
                    >
                      <Banknote size={20} />
                    </div>
                    <span className="text-[11px] font-bold">Espèces</span>
                    {paymentMethod === 'CASH' && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    )}
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-center text-muted px-6 italic leading-relaxed">
                Vos billets seront générés instantanément après la confirmation
                de la transaction.
              </p>
            </div>

            {/* Pied de Modal Fixe */}
            <div className="p-5 bg-surface border-t border-muted/10 shrink-0">
              <Button
                onClick={handleFinalConfirm}
                disabled={isProcessing || !paymentMethod}
                className={`w-full py-2 rounded-[1.5rem] text-base font-bold transition-all shadow-xl ${
                  isProcessing
                    ? 'bg-muted'
                    : 'bg-btn shadow-btn/30 hover:scale-[1.02] active:scale-95'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-3">
                    <Loader2 className="animate-spin" size={20} /> Traitement en
                    cours...
                  </span>
                ) : (
                  `Payer ${(selectedTicketType.price * quantities[selectedTicketType.id]).toLocaleString()} FCFA`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// 1. Définition du type des props
interface PaymentOptionProps {
  active: boolean;
  onClick: () => void;
  color: string;
  label: string;
}
// Composant pour les tuiles d'opérateurs
function PaymentOptionSmall({
  active,
  onClick,
  color,
  label,
}: PaymentOptionProps) {
  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all cursor-pointer gap-2
        ${active ? 'border-brand bg-brand/5 shadow-inner' : 'border-muted/10 hover:border-brand/30'}`}
    >
      <div
        className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white shadow-lg`}
      >
        <Smartphone size={20} />
      </div>
      <span className="text-[11px] font-bold uppercase tracking-wider">
        {label}
      </span>
      {active && (
        <div className="absolute top-3 right-3 bg-brand text-white rounded-full p-1 shadow-md">
          <CheckCircle2 size={12} />
        </div>
      )}
    </div>
  );
}
function AuthPrompt() {
  return (
    <div className="flex flex-col items-center justify-center p-16 bg-surface rounded-[3rem] border-2 border-dashed border-muted/20 text-center">
      <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mb-6">
        <TicketCheck size={40} className="text-brand" />
      </div>
      <h3 className="text-xl font-bold mb-2 font-title">
        Prêt pour l&apos;aventure ?
      </h3>
      <p className="text-muted mb-8 max-w-xs text-sm">
        Connectez-vous pour réserver vos places et participer aux loteries
        exclusives.
      </p>
      <Link href="/frontend/page/login">
        <Button className="bg-brand px-10 py-6 rounded-2xl font-bold text-lg shadow-2xl shadow-brand/20">
          Se connecter
        </Button>
      </Link>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="relative">
        <Loader2 className="animate-spin text-brand" size={48} />
        <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full"></div>
      </div>
      <p className="text-xs font-bold text-muted animate-pulse uppercase tracking-widest">
        Chargement des offres...
      </p>
    </div>
  );
}

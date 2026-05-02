'use client';

import { useEffect, useState } from 'react';
import {
  Edit3,
  Trash2,
  Ticket,
  Users,
  Calendar,
  Check,
  X,
  Loader2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import {
  TicketType,
  UpdateTicketTypeDTO,
} from '../../module/tickets/typesTicket/domain/entities/ticketType.entity';
import { TicketTypeRepository } from '../../module/tickets/typesTicket/infrastructure/ticketType.repository';
import { TicketTypeService } from '../../module/tickets/typesTicket/application/typeTicket.service';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-toastify';

type Props = { eventId: string };
const typeTicketService = new TicketTypeService(new TicketTypeRepository());

export default function TypeTicket({ eventId }: Props) {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TicketType>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTypeTicket();
  }, [eventId]);

  const fetchTypeTicket = async () => {
    try {
      setLoading(true);
      const data = await typeTicketService.findAllByEventId(eventId);
      setTicketTypes(data);
    } catch (error) {
      toast.error('Erreur lors de la récupération des billets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      setIsSubmitting(true);
      const updateDto: UpdateTicketTypeDTO = {
        name: editForm.name,
        price: editForm.price,
        quantity: editForm.quantity ?? 1,
        maxPerUser: editForm.maxPerUser ?? 1,
      };
      await typeTicketService.update(editingId, updateDto);

      setTicketTypes((prev) =>
        prev.map((t) =>
          t.id === editingId ? ({ ...t, ...editForm } as TicketType) : t,
        ),
      );
      setEditingId(null);
      toast.success('Ticket mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-teal-500" />
          <div className="absolute inset-0 blur-xl bg-teal-500/20 animate-pulse rounded-full"></div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">
          Synchronisation de la billetterie...
        </p>
      </div>
    );
  }

  return (
    <section className="w-full space-y-8 animate-in fade-in duration-700">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Configurations <span className="text-teal-500">Billets</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Gérez les tarifs, quotas et restrictions par utilisateur.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 px-5 py-2.5 rounded-2xl border border-teal-500/20">
          <Ticket className="w-5 h-5" />
          <span className="font-bold tracking-tight">
            {ticketTypes.length} Catégories
          </span>
        </div>
      </div>

      {/* --- GRID --- */}
      {ticketTypes.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
          <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-slate-400" size={32} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Aucun type de ticket configuré.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ticketTypes.map((type) => (
            <div
              key={type.id}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-teal-500/10 hover:-translate-y-1"
            >
              {/* Accent Bar */}
              <div className="h-2 bg-slate-100 dark:bg-slate-800 group-hover:bg-teal-500 transition-colors duration-500" />

              <div className="p-8">
                {editingId === type.id ? (
                  /* --- EDIT MODE --- */
                  <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">
                        Nom du ticket
                      </label>
                      <input
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">
                          Prix (CFA)
                        </label>
                        <input
                          type="number"
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white"
                          value={editForm.price}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              price: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">
                          Places
                        </label>
                        <input
                          type="number"
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white"
                          value={editForm.quantity ?? 1}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              quantity: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button
                        disabled={isSubmitting}
                        onClick={handleUpdate}
                        className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl py-6 font-bold shadow-lg shadow-teal-500/20"
                      >
                        {isSubmitting ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" /> Valider
                          </>
                        )}
                      </Button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* --- VIEW MODE --- */
                  <>
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-4 bg-teal-500/10 dark:bg-teal-500/20 rounded-2xl text-teal-500">
                        <Ticket size={28} strokeWidth={2.5} />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1">
                          Prix Unitaire
                        </p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                          {type.price.toLocaleString()}
                          <span className="text-sm font-bold text-teal-500 ml-1 italic">
                            CFA
                          </span>
                        </p>
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6 line-clamp-1">
                      {type.name}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent dark:border-white/5 group-hover:border-teal-500/20 transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-3.5 h-3.5 text-teal-500" />
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            Max/pers
                          </span>
                        </div>
                        <p className="font-black text-lg text-slate-700 dark:text-slate-200">
                          {type.maxPerUser}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent dark:border-white/5 group-hover:border-teal-500/20 transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-3.5 h-3.5 text-teal-500" />
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            Dispo
                          </span>
                        </div>
                        <p className="font-black text-lg text-slate-700 dark:text-slate-200">
                          {type.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setEditingId(type.id);
                          setEditForm(type);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-900/10 dark:shadow-white/5"
                      >
                        <Edit3 size={16} /> MODIFIER
                      </button>
                      <button className="p-4 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

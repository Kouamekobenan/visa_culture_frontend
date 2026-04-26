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
} from 'lucide-react';
import {
  TicketType,
  UpdateTicketTypeDTO,
} from '../../module/tickets/typesTicket/domain/entities/ticketType.entity';
import { TicketTypeRepository } from '../../module/tickets/typesTicket/infrastructure/ticketType.repository';
import { TicketTypeService } from '../../module/tickets/typesTicket/application/typeTicket.service';
import { formatDate } from '../../utils/types/conversion.data';
import { Button } from '../../components/ui/Button';

type Props = { eventId: string };
const typeTicketService = new TicketTypeService(new TicketTypeRepository());

export default function TypeTicket({ eventId }: Props) {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TicketType>>({});

  useEffect(() => {
    fetchTypeTicket();
  }, [eventId]);

  const fetchTypeTicket = async () => {
    try {
      setLoading(true);
      const data = await typeTicketService.findAllByEventId(eventId);
      setTicketTypes(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
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
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand" />
        <p className="text-slate-500 animate-pulse">
          Chargement de la billetterie...
        </p>
      </div>
    );
  }

  return (
    <section className="w-full space-y-6 bg-brand/10 p-2.5 rounded-xl bg-background">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Configurations des Billets
          </h2>
          <p className="text-muted text-sm">
            Gérez les tarifs et les quotas pour cet événement.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl border border-brand/20">
          <Ticket className="w-4 h-4" />
          <span className="font-bold">{ticketTypes.length} Types</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ticketTypes.map((type) => (
          <div
            key={type.id}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-brand/50 transition-all duration-300"
          >
            {/* Header de la carte avec indicateur visuel */}
            <div className="h-2 bg-slate-100 dark:bg-slate-800 group-hover:bg-brand transition-colors" />

            <div className="p-6">
              {editingId === type.id ? (
                /* --- FORMULAIRE D'ÉDITION --- */
                <div className="space-y-4 animate-in fade-in zoom-in duration-200">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">
                      Nom du ticket
                    </label>
                    <input
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand outline-none transition-all"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">
                        Prix (CFA)
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand outline-none transition-all"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            price: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">
                        Stock
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand outline-none transition-all"
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
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleUpdate}
                      className="flex-1 bg-brand text-white rounded-xl shadow-lg shadow-brand/20"
                    >
                      <Check className="w-4 h-4 mr-2" /> Valider
                    </Button>
                    <Button
                      onClick={() => setEditingId(null)}
                      className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                /* --- VUE PROFESSIONNELLE --- */
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-brand/5 rounded-2xl">
                      <Ticket className="w-6 h-6 text-brand" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                        Tarif Unitaire
                      </p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">
                        {type.price.toLocaleString()}{' '}
                        <span className="text-sm font-medium text-brand">
                          CFA
                        </span>
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 truncate">
                    {type.name}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <Users className="w-3 h-3 text-slate-500" />
                      </div>
                      <div className="text-xs">
                        <p className="text-slate-400 leading-none">Max/pers</p>
                        <p className="font-bold text-slate-700 dark:text-slate-200">
                          {type.maxPerUser}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <Calendar className="w-3 h-3 text-slate-500" />
                      </div>
                      <div className="text-xs">
                        <p className="text-slate-400 leading-none">
                          Disponibilité
                        </p>
                        <p className="font-bold text-slate-700 dark:text-slate-200">
                          {type.quantity} places
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(type.id);
                        setEditForm(type);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-brand/10 hover:text-brand text-slate-600 dark:text-slate-300 rounded-xl font-semibold transition-all"
                    >
                      <Edit3 className="w-4 h-4" /> Modifier
                    </button>
                    <button
                      onClick={() => {
                        /* Implémenter delete avec un modal custom */
                      }}
                      className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

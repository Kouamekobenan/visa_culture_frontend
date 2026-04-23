import { useEffect, useState } from 'react';
import {
  TicketType,
  UpdateTicketTypeDTO,
} from '../../module/tickets/typesTicket/domain/entities/ticketType.entity';
import { TicketTypeRepository } from '../../module/tickets/typesTicket/infrastructure/ticketType.repository';
import { TicketTypeService } from '../../module/tickets/typesTicket/application/typeTicket.service';
import { formatDate } from '../../utils/types/conversion.data';
import { Button } from '../../components/ui/Button';

type Props = {
  eventId: string;
};
// Instanciation en dehors du composant pour éviter la recréation au re-render
const typeTicketService = new TicketTypeService(new TicketTypeRepository());

export default function TypeTicket({ eventId }: Props) {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);

  // État pour la modification
  const [editingId, setEditingId] = useState<string | null>();
  const [editForm, setEditForm] = useState<Partial<TicketType>>({});

  useEffect(() => {
    fetchTypeTicket();
  }, [eventId]);

  const fetchTypeTicket = async () => {
    try {
      setLoading(true);
      const data = await typeTicketService.findAllByEventId(eventId);
      console.log('data to tickets types', data);
      setTicketTypes(data);
    } catch (error) {
      console.error('Error fetching ticket types:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce type de ticket ?')) return;
    try {
      await typeTicketService.delete(id);
      setTicketTypes((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };
  // --- Logique de Modification ---
  const startEdit = (ticket: TicketType) => {
    setEditingId(ticket.id);
    setEditForm(ticket);
  };
  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      // On construit le DTO en s'assurant qu'aucune valeur n'est nulle
      const updateDto: UpdateTicketTypeDTO = {
        name: editForm.name ?? undefined,
        price: editForm.price ?? undefined,
        quantity: editForm.quantity ?? undefined, // Si c'est null, on passe undefined
        maxPerUser: editForm.maxPerUser ?? undefined,
      };

      await typeTicketService.update(editingId, updateDto);

      setTicketTypes((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, ...editForm } : t)),
      );
      setEditingId(null);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };
  return (
    <section className="w-full bg-surface dark:bg-surface border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6 shadow-sm transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-title">
          Catégories de Billetterie
        </h2>
        <span className="text-xs font-sans text-white bg-slate-200/50 dark:bg-slate-700 px-3 py-2 rounded-full">
          {ticketTypes.length} Catégories
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(ticketTypes) ? (
          ticketTypes?.map((type) => (
            <div
              key={type.id}
              className="group relative flex flex-col bg-white dark:bg-slate-800/50 border border-transparent hover:border-brand p-5 rounded-xl transition-all duration-300 shadow-sm"
            >
              {editingId === type?.id ? (
                /* --- MODE ÉDITION --- */
                <div className="space-y-3">
                  <input
                    className="w-full p-2 bg-background text-muted border rounded font-title"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      className="p-2 bg-background border text-muted rounded text-sm"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          price: Number(e.target.value),
                        })
                      }
                    />
                    <input
                      type="number"
                      className="p-2 bg-background border text-muted rounded text-sm"
                      value={editForm.quantity ?? 1}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          quantity: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleUpdate}
                      className="flex-1 bg-btn text-white py-2 px-2 rounded-lg font-bold text-sm"
                    >
                      Sauvegarder
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-slate-500 text-white py-2 rounded-lg font-bold text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                /* --- MODE VUE --- */
                <>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {type.name}
                    </h3>
                    <p className="text-2xl font-bold text-brand">
                      {type.price} Fcfa
                    </p>
                  </div>

                  <div className="space-y-2 mb-6 flex-grow">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Quantité :</span>
                      <span className="font-semibold">{type.quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Max/pers :</span>
                      <span className="font-semibold">{type.maxPerUser}</span>
                    </div>
                    <hr className="border-slate-100 dark:border-slate-700 my-2" />
                    <div className="text-[11px] text-muted uppercase tracking-wider">
                      Ventes : {formatDate(type.saleStart)} →{' '}
                      {formatDate(type.saleEnd)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => startEdit(type)}
                      className="flex-1 px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-brand hover:text-white text-foreground rounded-lg text-sm font-bold transition-all"
                    >
                      Modifier
                    </Button>
                    <button
                      onClick={() => handleDelete(type.id)}
                      className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-error hover:bg-error hover:text-white rounded-lg text-sm transition-all"
                    >
                      Suppr.
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-muted col-span-full text-center py-10">
            Aucun ticket disponible ou format de données invalide.
          </p>
        )}
      </div>
    </section>
  );
}

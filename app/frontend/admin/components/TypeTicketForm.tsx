import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Ticket, DollarSign } from 'lucide-react';
import {
  CreateTicketFormValues,
  createTicketSchema,
} from './ValuedateTypeTicketDto';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTicketFormValues) => void;
  eventId: string;
  isLoading?: boolean;
}

export const CreateTicketModal = ({
  isOpen,
  onClose,
  onSubmit,
  eventId,
  isLoading,
}: TicketModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTicketFormValues>({
    // <--- Ajoute le type ici
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      name: '',
      eventId: eventId,
      price: 0,
      quantity: 1,
      maxPerUser: 1,
      saleStart: '',
      saleEnd: '',
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Nouveau Type de Ticket
            </h2>
            <p className="text-xs text-slate-500">
              Définissez les tarifs et quotas pour cet événement
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Nom du ticket */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Nom de la catégorie
            </label>
            <div className="relative">
              <Ticket
                className="absolute left-3 top-2.5 text-slate-400"
                size={18}
              />
              <input
                {...register('name')}
                placeholder="Ex: Pass VIP, Early Bird..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-[10px] mt-1 font-bold">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Prix */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Prix (FCFA)
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-2.5 text-slate-400"
                  size={18}
                />
                <input
                  type="number"
                  {...register('price')}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none dark:text-white"
                />
              </div>
            </div>

            {/* Quantité */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Stock Total
              </label>
              <input
                type="number"
                {...register('quantity')}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Dates de vente */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Début des ventes
              </label>
              <input
                type="datetime-local"
                {...register('saleStart')}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-xs dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Fin des ventes
              </label>
              <input
                type="datetime-local"
                {...register('saleEnd')}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-xs dark:text-white"
              />
              {errors.saleEnd && (
                <p className="text-red-500 text-[10px] mt-1 font-bold">
                  {errors.saleEnd.message}
                </p>
              )}
            </div>
          </div>

          {/* Limite par utilisateur */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Limite max par client
            </label>
            <input
              type="number"
              {...register('maxPerUser')}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none dark:text-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-black shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Création...' : 'Créer le type de ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

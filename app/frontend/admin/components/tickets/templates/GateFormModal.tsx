'use client';

import { useState } from 'react';
import { DoorOpen, X, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/app/frontend/components/ui/Button';
import { ControllerRepository } from '@/app/frontend/controler/module/controller/infrastructure/controllerProfile.repository';

interface GateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onSuccess: () => void;
}
const controllerService = new ControllerRepository();

export default function GateFormModal({
  isOpen,
  onClose,
  eventId,
  onSuccess,
}: GateFormModalProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Le nom de la porte est requis');

    try {
      setIsSubmitting(true);
      
      await controllerService.createGate({ name, eventId });
      console.log('Creating gate:', { name, eventId });
      // Simulation d'api
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(`Porte "${name}" créée avec succès`);
      setName('');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la création de la porte');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="relative p-8 text-center border-b border-slate-100 dark:border-white/5">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>

          <div className="mx-auto w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-500 mb-4">
            <DoorOpen size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Nouvelle <span className="text-title">Porte</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configurez un point d&apos;accès pour cet événement
          </p>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] ml-2">
              Nom de l&apos;accès
            </label>
            <input
              autoFocus
              type="text"
              placeholder="Ex: Entrée Principale, VIP Nord..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-teal-500 dark:text-white rounded-2xl outline-none transition-all placeholder:text-slate-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              size='md'
              className="w-full py-4  text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-500/20 transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={20} /> ACTIVER LA PORTE
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  X,
  Upload,
  MapPin,
  Loader2,
  Calendar,
  Clock,
  Type,
  AlignLeft,
} from 'lucide-react';
import { Button } from '@/app/frontend/components/ui/Button';
import Image from 'next/image';
import { CreateEventDto } from '../../module/event/domain/entities/event.entity';
import { useAuth } from '../../context/useContext';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEventDto, file: File | null) => Promise<void>;
  initialData?: CreateEventDto;
}

export default function EventFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: EventFormModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: initialData || {
      title: '',
      description: '',
      location: '',
      date: '',
      time: '',
      isActivate: true,
      organizerId: user?.id,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onFormSubmit = async (data: CreateEventDto) => {
    setIsSubmitting(true);
    try {
      const combinedDate = new Date(`${data.date}T${data.time}`);
      const finalDto = { ...data, date: combinedDate.toISOString() };
      await onSubmit(finalDto, selectedFile);
      reset();
      setPreview(null);
      onClose();
    } catch (error) {
      console.error('Erreur soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      {/* Conteneur principal avec hauteur maximale contrôlée */}
      <div className="bg-white dark:bg-slate-950 w-full max-w-lg max-h-[90vh] flex flex-col rounded-[2rem] shadow-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        {/* HEADER - Fixé en haut */}
        <div className="relative px-8 pt-8 pb-4 shrink-0">
          <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            {initialData ? 'Édition' : 'Nouvel Événement'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Remplissez les informations essentielles ci-dessous.
          </p>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-rose-500 rounded-full transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* FORMULAIRE - Défilable si le contenu est trop grand */}
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="px-8 pb-8 space-y-5 overflow-y-auto custom-scrollbar"
        >
          {/* UPLOAD SECTION */}
          <div className="relative group shrink-0">
            <div
              className={`relative h-28 w-full rounded-2xl border-2 border-dashed transition-all overflow-hidden flex items-center justify-center ${
                preview
                  ? 'border-transparent'
                  : 'border-slate-200 dark:border-slate-800 group-hover:border-brand/50 bg-slate-50/50 dark:bg-slate-900/50'
              }`}
            >
              {preview ? (
                <>
                  <Image
                    src={preview}
                    fill
                    className="object-cover"
                    alt="Preview"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        setSelectedFile(null);
                      }}
                      className="bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xl uppercase"
                    >
                      Changer l&apos;image
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <Upload className="h-5 w-5 text-brand mx-auto mb-1" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Affiche (PNG, JPG)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* TITRE */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">
                Nom de l&apos;événement
              </label>
              <div className="relative">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  {...register('title', { required: true })}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none"
                  placeholder="ex: Festival d'Été"
                />
              </div>
            </div>

            {/* LIEU */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">
                Localisation
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  {...register('location', { required: true })}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none"
                  placeholder="Ville, Stade, Salle..."
                />
              </div>
            </div>

            {/* DATE & HEURE */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    {...register('date', { required: true })}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm font-medium outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">
                  Heure
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="time"
                    {...register('time', { required: true })}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm font-medium outline-none"
                  />
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">
                Description
              </label>
              <div className="relative">
                <AlignLeft className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                <textarea
                  {...register('description')}
                  rows={2}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm font-medium outline-none focus:border-brand resize-none"
                  placeholder="Quelques mots sur l'événement..."
                />
              </div>
            </div>
          </div>

          {/* ACTIONS FINALES - Souvent le problème sur petit écran */}
          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white dark:bg-slate-950 py-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-3 bg-brand hover:bg-brand/90 text-white rounded-xl shadow-lg shadow-brand/20 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-5 w-5 mx-auto" />
              ) : (
                "Publier l'événement"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Style CSS pour cacher la scrollbar mais garder le scroll (optionnel) */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}</style>
    </div>
  );
}

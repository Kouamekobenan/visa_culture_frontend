'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  X,
  MapPin,
  Loader2,
  Calendar,
  Clock,
  Type,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/app/frontend/components/ui/Button';
import Image from 'next/image';
import { UpdateEventDto } from '../../module/event/domain/entities/event.entity';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateEventDto, file: File | null) => Promise<void>;
  initialData: UpdateEventDto & { id: string }; // On a besoin de l'ID pour la modification
}

export default function EditEventModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: EditEventModalProps) {
  const [preview, setPreview] = useState<string | null>(
    initialData?.imageUrl || null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extraction de la date et de l'heure à partir de l'ISO string initiale
  const initialDate = initialData?.date ? initialData.date.split('T')[0] : '';
  const initialTime = initialData?.date
    ? initialData.date.split('T')[1].substring(0, 5)
    : '';

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      location: initialData?.location || '',
      date: initialDate,
      time: initialTime,
      isActivate: initialData?.isActivate ?? true,
      imageUrl: initialData?.imageUrl || '',
    },
  });

  // Mise à jour si initialData change (quand on ouvre la modale)
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        date: initialData.date.split('T')[0],
        time: initialData.date.split('T')[1].substring(0, 5),
      });
      setPreview(initialData.imageUrl);
    }
  }, [initialData, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onFormSubmit = async (data: UpdateEventDto) => {
    setIsSubmitting(true);
    try {
      // Recomposition de la date ISO
      const combinedDate = new Date(`${data.date}T${data.time}`);

      const finalDto: UpdateEventDto = {
        title: data.title,
        description: data.description,
        location: data.location,
        date: combinedDate.toISOString(),
        isActivate: data.isActivate,
        imageUrl: data.imageUrl, // L'ancienne URL si pas de nouveau fichier
      };

      await onSubmit(finalDto, selectedFile);
      onClose();
    } catch (error) {
      console.error('Erreur modification:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* HEADER */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Modifier l&apos;événement
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
              Édition des paramètres globaux
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-rose-500 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="px-8 pb-8 space-y-5"
        >
          {/* IMAGE PREVIEW / UPLOAD */}
          <div className="group relative h-40 w-full bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 overflow-hidden transition-all hover:border-teal-500/50">
            {preview ? (
              <>
                <Image
                  src={preview}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  alt="Event"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-black uppercase">
                    Remplacer l&apos;image
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ImageIcon size={32} className="mb-2" />
                <span className="text-[10px] font-black uppercase">
                  Aucune image
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* TITRE */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2">
                Nom officiel
              </label>
              <div className="relative">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500" />
                <input
                  {...register('title', { required: true })}
                  className="w-full pl-12 pr-4 py-3 dark:text-white  bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            {/* LIEU */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2">
                Localisation
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500" />
                <input
                  {...register('location', { required: true })}
                  className="w-full pl-12 pr-4 py-3 dark:text-white  bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            {/* DATE & HEURE */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  {...register('date', { required: true })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:text-white  dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:border-teal-500"
                />
              </div>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="time"
                  {...register('time', { required: true })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:text-white  dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 dark:text-white  dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none focus:border-teal-500 resize-none font-medium"
              />
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-4 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4  text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                'Enregistrer les modifications'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

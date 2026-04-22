'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Gift, Upload, Loader2, Type, AlignLeft } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/app/frontend/components/ui/Button';
import { CreatePrizeFormValues, createPrizeSchema } from './ValidatePrizeForm';
interface PrizeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePrizeFormValues, file: File | null) => Promise<void>;
  lotterId: string; // L'ID de la tombola liée à l'événement
}
export default function PrizeFormModal({
  isOpen,
  onClose,
  onSubmit,
  lotterId,
}: PrizeFormModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePrizeFormValues>({
    resolver: zodResolver(createPrizeSchema),
    defaultValues: {
      lotterId: lotterId,
      title: '',
      description: '',
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
  const onFormSubmit = async (data: CreatePrizeFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data, selectedFile);
      reset();
      setPreview(null);
      setSelectedFile(null);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création du prix:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white  dark:bg-slate-950 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Nouveau lot Tombola
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              Récompense pour les gagnants
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-rose-500 rounded-full transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="px-8 pb-8 space-y-5"
        >
          {/* Image Upload */}
          <div className="group relative h-36 w-full bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden transition-all hover:border-purple-500/50">
            {preview ? (
              <>
                <Image
                  src={preview}
                  fill
                  className="object-cover"
                  alt="Prix preview"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-[10px] font-black uppercase">
                    Changer l&apos;image
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center">
                <Upload className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Photo du lot
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
          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                Désignation
              </label>
              <div className="relative">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500" />
                <input
                  {...register('title')}
                  placeholder="Ex: iPhone 15 Pro, Bon d'achat..."
                  className="w-full pl-12 pr-4 py-3 dark:text-white text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              {errors.title && (
                <p className="text-red-500 text-[10px] font-bold ml-2">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                Description
              </label>
              <div className="relative">
                <AlignLeft className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Détails du lot..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 text-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>
          </div>
          {/* Bouton de validation */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Gift size={18} />
                Ajouter à la tombola
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

'use client';
import { Button } from '@/app/frontend/components/ui/Button';
import { UserService } from '@/app/frontend/module/authentification/application/user.service';
import {
  UpdateUserDto,
  User as users,
} from '@/app/frontend/module/authentification/domain/entities/user.entity';
import { UserRepository } from '@/app/frontend/module/authentification/infrastructure/user.repository';
import { User, X } from 'lucide-react';
import { useMemo, useState } from 'react';

export const EditProfilePanel = ({
  user,
  onClose,
}: {
  user: users;
  onClose: () => void;
}) => {
  const userService = useMemo(() => new UserService(new UserRepository()), []);

  // Initialisation directe pour éviter l'erreur de cascade de rendu
  const [formData, setFormData] = useState<UpdateUserDto>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    const result = await userService.execute(user.id, formData);
    console.log('Update success:', result);
    onClose(); // Ferme le panneau après succès
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
              <User size={18} className="text-brand" />
            </div>
            <h2 className="font-title font-bold text-foreground text-base">
              Modifier mon profil
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-muted/10 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 p-6 space-y-5 overflow-y-auto"
        >
          <div>
            <label className="block text-xs font-bold text-muted uppercase mb-2">
              Nom complet
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-muted/20 bg-background outline-none focus:ring-2 focus:ring-brand/50 transition-all"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted uppercase mb-2">
              Email
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-muted/20 bg-background outline-none focus:ring-2 focus:ring-brand/50 transition-all"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted uppercase mb-2">
              Téléphone
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-muted/20 bg-background outline-none focus:ring-2 focus:ring-brand/50 transition-all"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full py-4 rounded-2xl bg-brand text-white font-bold shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Sauvegarder les changements
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

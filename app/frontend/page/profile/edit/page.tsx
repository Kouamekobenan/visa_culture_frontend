'use client';
import { useAuth } from '@/app/frontend/context/useContext';
import { useState, useEffect } from 'react';

export default function PageEditUser() {
  const { user } = useAuth();

  // État local initialisé avec les données du DTO (sans le password)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
  });

  // On remplit le formulaire quand l'utilisateur est chargé
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'USER',
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Données envoyées au backend :', formData);
    // Ici, tu appelles ton API de refactoring/update
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-lg bg-surface border border-muted/20">
        {/* Titre avec la police Space Grotesk et ta couleur --title-color */}
        <h2 className="text-3xl font-bold mb-6 text-title font-title">
          Modifier mon profil
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-muted mb-1">
              Nom complet
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-muted/30 bg-background text-foreground focus:ring-2 focus:ring-brand outline-none transition-all"
              placeholder="Ex: Jean Dupont"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-muted mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-muted/30 bg-background text-foreground focus:ring-2 focus:ring-brand outline-none transition-all"
              placeholder="user@example.com"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-muted mb-1">
              Téléphone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-muted/30 bg-background text-foreground focus:ring-2 focus:ring-brand outline-none transition-all"
              placeholder="+225..."
            />
          </div>

          {/* Rôle (Lecture seule ou sélection selon tes droits) */}
          <div>
            <label className="block text-sm font-medium text-muted mb-1">
              Rôle
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-muted/30 bg-background text-foreground focus:ring-2 focus:ring-brand outline-none transition-all"
            >
              <option value="USER">Utilisateur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          {/* Bouton de validation avec ta couleur --btn-color */}
          <button
            type="submit"
            className="w-full py-3 mt-4 rounded-xl font-bold text-white bg-btn hover:opacity-90 transform active:scale-95 transition-all shadow-md"
          >
            Enregistrer les modifications
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Les modifications de sécurité se font dans l&apos;onglet paramètres.
        </p>
      </div>
    </div>
  );
}

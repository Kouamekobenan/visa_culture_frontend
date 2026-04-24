'use client';
import { useEffect, useState, useMemo } from 'react';
import { UserRepository } from '../../module/authentification/infrastructure/user.repository';
import { IUserController } from '../../module/authentification/domain/entities/user.entity';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Users,
  BarChart3,
  Activity,
  Eye,
} from 'lucide-react'; // Installe lucide-react pour le côté pro
import { ApiErrorResponse, UserRole } from '../../utils/types/manager.type';
import { toast } from 'react-toastify';
import axios from 'axios';
const userRepository = new UserRepository();
const PER_PAGE = 8;

export default function EspaceController() {
  const [controllers, setControllers] = useState<IUserController[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('scans-desc');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<IUserController | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  async function saveController() {
    // 1. Validation de base (Sécurité et UX)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!emailRegex.test(form.email)) {
      alert("Format d'email invalide.");
      return;
    }

    // Pour une création, le mot de passe est obligatoire
    if (!editTarget && (!form.password || form.password.length < 6)) {
      alert('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true); // Activer un loader sur le bouton

    try {
      if (editTarget) {
        // --- MODE ÉDITION ---
        // On n'envoie le password que s'il a été modifié
        const updateData = {
          name: form.name,
          phone: form.phone,
          email: form.email,
          ...(form.password ? { password: form.password } : {}),
        };

        await userRepository.update(editTarget.id, updateData);

        setControllers((prev) =>
          prev.map((c) =>
            c.id === editTarget.id ? { ...c, ...updateData } : c,
          ),
        );
      } else {
        // --- MODE CRÉATION ---
        // --- MODE CRÉATION ---
        const response = await userRepository.create({
          ...form,
          role: UserRole.CONTROLLER,
        });
        const newController: IUserController = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: 'CONTROLLER',
          totalScans: 0,
        } as IUserController;

        setControllers((prev) => [newController, ...prev]);
      }
      //   closeModal(); // Fermer et réinitialiser le formulaire
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        console.error('❌ Erreur Axios login:', error.response?.data);
        const message = error.response?.data?.message || 'Erreur de connexion';
        toast.error(message);
        throw new Error(error.response?.data?.message || 'Erreur de connexion');
      }
      // Erreur JS standard (réseau coupé, timeout, etc.)
      if (error instanceof Error) {
        console.error('❌ Erreur login:', error.message);
        throw new Error(error.message);
      }
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const fetchControllers = async () => {
      try {
        setLoading(true);
        const res = await userRepository.stats(1, 100);
        setControllers(res.data);
      } catch (err) {
        console.error('Erreur chargement contrôleurs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchControllers();
  }, []);
  // Calculs mémorisés pour la performance
  const filteredAndSorted = useMemo(() => {
    return [...controllers]
      .filter(
        (c) =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.phone?.includes(search),
      )
      .sort((a, b) => {
        if (sort === 'scans-desc')
          return (b.totalScans ?? 0) - (a.totalScans ?? 0);
        if (sort === 'scans-asc')
          return (a.totalScans ?? 0) - (b.totalScans ?? 0);
        if (sort === 'name-asc') return a.name.localeCompare(b.name);
        return b.name.localeCompare(a.name);
      });
  }, [controllers, search, sort]);

  const paginated = filteredAndSorted.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE,
  );
  const totalPages = Math.ceil(filteredAndSorted.length / PER_PAGE);
  const totalScans = controllers.reduce((s, c) => s + (c.totalScans ?? 0), 0);
  const avgScans = controllers.length
    ? Math.round(totalScans / controllers.length)
    : 0;
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand font-bold tracking-widest text-xs uppercase">
              <span className="w-8 h-[2px] bg-brand inline-block"></span>
              Administration
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              Gestion <span className="text-title">Contrôleurs</span>
            </h1>
            <p className="text-muted text-sm md:text-base font-medium">
              Surveillance en temps réel de l&apos;activité de scan.
            </p>
          </div>

          <button
            onClick={() => {
              setEditTarget(null);
              setForm({ name: '', phone: '', email: '', password: '' });
              setShowModal(true);
            }}
            className="group bg-btn hover:scale-105 active:scale-95 text-white px-3 py-2 rounded-2xl font-bold transition-all shadow-lg shadow-btn/20 flex items-center justify-center gap-2"
          >
            <Plus size={20} strokeWidth={3} />
            Recruter un agent
          </button>
        </header>

        {/* --- STATS CARDS --- */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Effectif total',
              val: controllers.length,
              icon: <Users />,
              color: 'text-brand',
            },
            {
              label: 'Volume Scans',
              val: totalScans.toLocaleString(),
              icon: <Activity />,
              color: 'text-title',
            },
            {
              label: 'Ratio Moyen',
              val: avgScans,
              icon: <BarChart3 />,
              color: 'text-btn',
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-surface border border-foreground/5 p-6 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute -right-4 -top-4 text-foreground/5 group-hover:scale-110 transition-transform duration-500">
                {s.icon}
              </div>
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2">
                {s.label}
              </p>
              <p className={`text-4xl font-bold ${s.color} tracking-tighter`}>
                {s.val}
              </p>
            </div>
          ))}
        </section>

        {/* --- FILTERS --- */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-surface/50 p-2 rounded-2xl border border-foreground/5">
          <div className="relative flex-1 w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              size={18}
            />
            <input
              type="text"
              placeholder="Chercher un nom ou mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-background rounded-xl border-none focus:ring-2 focus:ring-brand outline-none text-sm transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                size={14}
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full pl-10 pr-8 py-4 bg-background rounded-xl border-none text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-brand"
              >
                <option value="scans-desc">Top Performance</option>
                <option value="scans-asc">Moins actifs</option>
                <option value="name-asc">A-Z</option>
              </select>
            </div>
          </div>
        </div>
        {/* --- CONTROLLERS GRID --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted animate-pulse font-bold tracking-widest text-xs uppercase">
              Synchronisation...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginated.map((c) => (
              <div
                key={c.id}
                className="group relative bg-surface border border-foreground/5 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-brand/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 cursor-pointer group-hover:opacity-100 transition-opacity">
                  <button
                    // onClick={() => deleteController(c.id)}
                    className="text-brand bg-brand/25 p-2 hover:bg-error/10 rounded-full transition-colors"
                  >
                    <Eye size={18} className="cursor-pointer" />
                  </button>
                </div>
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Avatar avec effet "Inner Shadow" */}
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center text-2xl font-black text-brand shadow-inner rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    {c.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground leading-tight">
                      {c.name}
                    </h3>
                    <p className="text-xs font-bold text-muted tracking-tighter">
                      {c.phone}
                    </p>
                  </div>

                  <div className="w-full bg-background rounded-2xl p-4 space-y-1 border border-foreground/5">
                    <span className="text-[10px] uppercase font-black text-muted tracking-widest">
                      Points de contrôle
                    </span>
                    <div className="flex items-end justify-center gap-1">
                      <span className="text-3xl font-black text-title">
                        {c.totalScans ?? 0}
                      </span>
                      <span className="text-xs text-muted mb-1 font-bold">
                        scans
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditTarget(c);
                      setForm({
                        name: c.name,
                        phone: c.phone,
                        email: c.email,
                        password: c.password,
                      });
                      setShowModal(true);
                    }}
                    className="w-full py-3 bg-foreground/5 hover:bg-brand hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Edit3 size={14} /> Configurer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* --- MODAL (MODERNE) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay avec flou */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-xl transition-all"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-surface border border-foreground/10 rounded-[2.5rem] p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            {' '}
            <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tighter">
              {editTarget ? 'Éditer' : 'Nouveau'}
              <span className="text-brand text-xl block uppercase tracking-widest font-black">
                Profil Agent
              </span>
            </h2>
            <div className="space-y-4">
              {/* Champ Nom */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted ml-2">
                  Identité complète
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-background rounded-2xl border-none focus:ring-2 focus:ring-brand outline-none font-medium transition-shadow"
                  placeholder="ex: Marc Koffi"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              {/* Champ Téléphone */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted ml-2">
                  Ligne Directe
                </label>
                <input
                  type="tel"
                  className="w-full px-5 py-4 bg-background rounded-2xl border-none focus:ring-2 focus:ring-brand outline-none font-medium transition-shadow"
                  placeholder="+225..."
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              {/* Champ Email (NOUVEAU) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted ml-2">
                  Email Professionnel
                </label>
                <input
                  type="email"
                  className="w-full px-5 py-4 bg-background rounded-2xl border-none focus:ring-2 focus:ring-brand outline-none font-medium transition-shadow"
                  placeholder="agent@event.ci"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              {/* Champ Mot de passe (NOUVEAU) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted ml-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  className="w-full px-5 py-4 bg-background rounded-2xl border-none focus:ring-2 focus:ring-brand outline-none font-medium transition-shadow"
                  placeholder="••••••••"
                  value={form.password || ''}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <p className="text-[9px] text-muted ml-2 italic">
                  * Minimum 8 caractères recommandés
                </p>
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-4 text-sm font-bold text-muted hover:bg-foreground/5 rounded-2xl transition-colors"
              >
                Annuler
              </button>
              {/* Bouton remplacé */}
              <button
                onClick={saveController}
                disabled={isLoading}
                className="flex-[2] py-4 bg-btn text-white rounded-2xl font-black shadow-lg shadow-btn/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 hover:scale-[1.02] active:scale-95"
              >
                {isLoading && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                )}
                {isLoading
                  ? 'Création en cours...'
                  : editTarget
                    ? 'Enregistrer'
                    : 'Créer le compte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

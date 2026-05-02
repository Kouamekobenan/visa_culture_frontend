'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  ScanLine,
  DoorOpen,
  Plus,
  Search,
  RefreshCw,
  CheckCircle2,
  Wifi,
  WifiOff,
  Trash2,
  UserPlus,
  ChevronRight,
  Activity,
  Shield,
  Mail,
  Phone,
  BookOpen,
  X,
  AlertTriangle,
  Check,
} from 'lucide-react';
import Image from 'next/image';
import { ControllerRepository } from '../../controler/module/controller/infrastructure/controllerProfile.repository';
import { ControllerWithStats } from '../../controler/module/controller/domain/interface/dashbord-controlleur.dto';
import { Gate } from '../../controler/module/controller/domain/interface/controllerProfile.port';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreateControllerForm {
  fullName: string;
  email: string;
  phone: string;
  educationLevel: string;
  password: string;
}

// ─── API service (adapte l'URL à ton projet) ──────────────────────────────────

const API = '/api/v1/admin/controllers';
const token = () =>
  typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token()}`,
});

async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Jamais';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `il y a ${diff}s`;
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  accent = false,
  color = 'brand',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: boolean;
  color?: 'brand' | 'btn' | 'title';
}) {
  const colorMap = {
    brand: {
      bg: 'bg-brand/10',
      text: 'text-brand',
      glow: 'shadow-[0_0_20px_rgba(13,148,136,0.08)]',
    },
    btn: {
      bg: 'bg-btn/10',
      text: 'text-btn',
      glow: 'shadow-[0_0_20px_rgba(34,197,94,0.08)]',
    },
    title: {
      bg: 'bg-title/10',
      text: 'text-title',
      glow: 'shadow-[0_0_20px_rgba(249,115,22,0.08)]',
    },
  };
  const c = colorMap[color];

  return (
    <div
      className={`rounded-2xl p-5 bg-surface border border-foreground/5 ${accent ? c.glow : ''}`}
    >
      <div
        className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}
      >
        <Icon size={18} className={c.text} strokeWidth={1.8} />
      </div>
      <p className="font-title text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted mt-0.5">{label}</p>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border
        ${
          active
            ? 'text-btn bg-btn/10 border-btn/25'
            : 'text-muted bg-foreground/5 border-foreground/10'
        }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-btn animate-pulse' : 'bg-muted'}`}
      />
      {active ? 'Actif' : 'Inactif'}
    </span>
  );
}

function Avatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  if (photoUrl) {
    return (
      <Image
        src={'/images/logo.png'}
        alt={name}
        className="w-10 h-10 rounded-xl object-cover border border-foreground/10"
        width={200}
        height={100}
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
      <span className="text-brand text-xs font-bold font-title">
        {initials(name)}
      </span>
    </div>
  );
}

// ─── Controller Row ───────────────────────────────────────────────────────────

function ControllerRow({
  controller,
  gates,
  onAssignGate,
  onUnassignGate,
  onDelete,
}: {
  controller: ControllerWithStats;
  gates: Gate[];
  onAssignGate: (id: string, gateId: string) => Promise<void>;
  onUnassignGate: (id: string) => Promise<void>;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedGate, setSelectedGate] = useState(controller.gateId ?? '');
  const [loading, setLoading] = useState(false);

  async function handleAssign() {
    if (!selectedGate) return;
    setLoading(true);
    try {
      await onAssignGate(controller.userId, selectedGate);
    } finally {
      setLoading(false);
      setAssigning(false);
    }
  }

  async function handleUnassign() {
    setLoading(true);
    try {
      await onUnassignGate(controller.id);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden
        ${expanded ? 'bg-surface border-foreground/10 shadow-lg' : 'bg-surface border-foreground/5 hover:border-foreground/10'}
      `}
    >
      {/* Main row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Avatar + name */}
        <div className="relative shrink-0">
          <Avatar name={controller.fullName} photoUrl={controller.photoUrl} />
          {controller.isActive && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-btn border-2 border-background" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-title font-bold text-foreground text-[14px] truncate">
              {controller.fullName}
            </p>
            <StatusBadge active={controller.isActive} />
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Mail size={10} strokeWidth={2} />
              {controller.user.email}
            </span>
            {controller.gate ? (
              <span className="flex items-center gap-1 text-brand">
                <DoorOpen size={10} strokeWidth={2} />
                {controller.gate.name} — {controller.gate.event.title}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-muted/60">
                <DoorOpen size={10} strokeWidth={2} />
                Aucune porte
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-6 shrink-0">
          <div className="text-center">
            <p className="font-title font-bold text-foreground text-lg leading-none">
              {controller.totalScansToday}
            </p>
            <p className="text-[10px] text-muted mt-0.5">Aujourd&apos;hui</p>
          </div>
          <div className="text-center">
            <p className="font-title font-bold text-foreground text-lg leading-none">
              {controller.totalScansAllTime}
            </p>
            <p className="text-[10px] text-muted mt-0.5">Total</p>
          </div>
          <div className="text-center hidden md:block">
            <p className="text-[12px] text-foreground font-medium">
              {timeAgo(controller.lastScanAt)}
            </p>
            <p className="text-[10px] text-muted mt-0.5">Dernier scan</p>
          </div>
        </div>

        <ChevronRight
          size={16}
          strokeWidth={2}
          className={`shrink-0 text-muted transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
        />
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-foreground/[0.06] px-5 py-4 space-y-4">
          {/* Mobile stats */}
          <div className="sm:hidden grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-background border border-foreground/8 text-center">
              <p className="font-title font-bold text-foreground text-lg">
                {controller.totalScansToday}
              </p>
              <p className="text-[10px] text-muted">Aujourd&apos;hui</p>
            </div>
            <div className="p-3 rounded-xl bg-background border border-foreground/8 text-center">
              <p className="font-title font-bold text-foreground text-lg">
                {controller.totalScansAllTime}
              </p>
              <p className="text-[10px] text-muted">Total</p>
            </div>
            <div className="p-3 rounded-xl bg-background border border-foreground/8 text-center">
              <p className="text-[11px] font-medium text-foreground">
                {timeAgo(controller.lastScanAt)}
              </p>
              <p className="text-[10px] text-muted">Dernier scan</p>
            </div>
          </div>

          {/* Info row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {controller.user.phone && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-background border border-foreground/8 text-sm">
                <Phone size={13} className="text-muted" strokeWidth={2} />
                <span className="text-foreground text-[13px]">
                  {controller.user.phone}
                </span>
              </div>
            )}
            {controller.educationLevel && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-background border border-foreground/8 text-sm">
                <BookOpen size={13} className="text-muted" strokeWidth={2} />
                <span className="text-foreground text-[13px]">
                  {controller.educationLevel}
                </span>
              </div>
            )}
          </div>

          {/* Gate management */}
          <div className="p-4 rounded-2xl bg-background border border-foreground/8">
            <p className="text-[11px] font-bold text-muted uppercase tracking-[0.08em] mb-3">
              Gestion de la porte
            </p>
            {controller.gate && !assigning ? (
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                    <DoorOpen
                      size={14}
                      className="text-brand"
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">
                      {controller.gate.name}
                    </p>
                    <p className="text-[11px] text-muted">
                      {controller.gate.event.title}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAssigning(true)}
                    className="px-3 py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground text-xs font-medium transition-all"
                  >
                    Changer
                  </button>
                  <button
                    onClick={handleUnassign}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-lg bg-error/10 hover:bg-error/15 text-error text-xs font-medium transition-all"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedGate}
                  onChange={(e) => setSelectedGate(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-surface border border-foreground/10 text-foreground text-[13px] outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all"
                >
                  <option value="">Sélectionner une porte...</option>
                  {gates.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} — {g.event.title}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssign}
                  disabled={!selectedGate || loading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-btn text-background text-[13px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
                >
                  {loading ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Check size={13} strokeWidth={2.5} />
                  )}
                  Assigner
                </button>
                {assigning && (
                  <button
                    onClick={() => setAssigning(false)}
                    className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-muted transition-all"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Delete */}
          <div className="flex justify-end">
            <button
              onClick={() => onDelete(controller.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-error/10 hover:bg-error/15 text-error text-[13px] font-medium transition-all"
            >
              <Trash2 size={13} strokeWidth={2} />
              Supprimer le contrôleur
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Create Modal ─────────────────────────────────────────────────────────────

import { Eye, EyeOff } from 'lucide-react';

function CreateModal({
  onClose,
}: {
  onClose: () => void;
  onCreate: (data: CreateControllerForm) => Promise<void>;
}) {
  const [form, setForm] = useState<CreateControllerForm>({
    fullName: '',
    email: '',
    phone: '',
    educationLevel: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  function update(field: keyof CreateControllerForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await controllerService.create(form);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de la création',
      );
    } finally {
      setLoading(false);
    }
  }

  const textFields = [
    {
      label: 'Nom complet',
      field: 'fullName' as const,
      icon: Shield,
      placeholder: 'Jean Dupont',
      type: 'text',
    },
    {
      label: 'Email',
      field: 'email' as const,
      icon: Mail,
      placeholder: 'jean@example.com',
      type: 'email',
    },
    {
      label: 'Téléphone',
      field: 'phone' as const,
      icon: Phone,
      placeholder: '+2250700000000',
      type: 'tel',
    },
    {
      label: "Niveau d'études",
      field: 'educationLevel' as const,
      icon: BookOpen,
      placeholder: 'Bac+2',
      type: 'text',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface border border-foreground/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-foreground/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
              <UserPlus size={17} className="text-brand" strokeWidth={2} />
            </div>
            <h2 className="font-title font-bold text-foreground text-[17px]">
              Nouveau contrôleur
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-foreground/8 text-muted transition-all"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Text fields */}
          {textFields.map(({ label, field, icon: Icon, placeholder, type }) => (
            <div key={field}>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-[0.08em] mb-1.5">
                {label}
              </label>
              <div className="relative">
                <Icon
                  size={14}
                  strokeWidth={2}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type={type}
                  value={form[field]}
                  onChange={(e) => update(field, e.target.value)}
                  placeholder={placeholder}
                  required={field !== 'educationLevel'}
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-background border border-foreground/10 text-foreground text-[13px] placeholder:text-muted/50 outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all"
                />
              </div>
            </div>
          ))}

          {/* Password field */}
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-[0.08em] mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Shield
                size={14}
                strokeWidth={2}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-11 py-3 rounded-xl bg-background border border-foreground/10 text-foreground text-[13px] placeholder:text-muted/50 outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors p-0.5 rounded"
              >
                {showPassword ? (
                  <EyeOff size={15} strokeWidth={2} />
                ) : (
                  <Eye size={15} strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error/10 border border-error/20 text-error text-[13px]">
              <AlertTriangle size={14} strokeWidth={2} />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-foreground/10 text-foreground text-[14px] font-medium hover:bg-foreground/5 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-btn text-background text-[14px] font-semibold disabled:opacity-50 hover:opacity-90 transition-all shadow-[0_4px_16px_rgba(34,197,94,0.2)]"
            >
              {loading ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <CheckCircle2 size={15} strokeWidth={2} />
              )}
              {loading ? 'Création...' : 'Créer le contrôleur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({
  controller,
  onConfirm,
  onClose,
}: {
  controller: ControllerWithStats;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-surface border border-foreground/10 rounded-3xl shadow-2xl p-6">
        <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-error" strokeWidth={1.5} />
        </div>
        <h2 className="font-title font-bold text-foreground text-[18px] text-center mb-2">
          Supprimer le contrôleur ?
        </h2>
        <p className="text-muted text-sm text-center mb-6">
          <strong className="text-foreground">{controller.fullName}</strong>{' '}
          sera rétrogradé en PARTICIPANT. Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-foreground/10 text-foreground text-[14px] font-medium hover:bg-foreground/5 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handle}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-error text-white text-[14px] font-semibold disabled:opacity-50 hover:opacity-90 transition-all"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} strokeWidth={2} />
            )}
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const controllerService = new ControllerRepository();

export default function AdminControllerDashboard() {
  const [controllers, setControllers] = useState<ControllerWithStats[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<
    'all' | 'active' | 'inactive' | 'no-gate'
  >('all');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ControllerWithStats | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [ctrl, gts] = await Promise.all([
        controllerService.findAllWithStats(),
        controllerService.findAllGates(),
      ]);
      setControllers(ctrl);
      setGates(gts);
      setError(null);
      console.log('data', ctrl);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  //   // Auto-refresh toutes les 30s
  useEffect(() => {
    const interval = setInterval(() => load(true), 30_000);
    return () => clearInterval(interval);
  }, [load]);
  //
  async function handleCreate(data: CreateControllerForm) {
    await apiPost(API, data);
    await load(true);
  }

  async function handleAssignGate(id: string, gateId: string) {
    await controllerService.assigneGate(id, { gateId });
    await load(true);
  }
  // Par encore dans les api ou endPoint pas encore crée
  async function handleUnassignGate(id: string) {
    await controllerService.unassigneGate(id);
    await load(true);
  }

  async function handleDelete(id: string) {
    await controllerService.delete(id);
    setDeleteTarget(null);
    await load(true);
  }
  // Filter + search
  const filtered = controllers.filter((c) => {
    const matchSearch =
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.user.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && c.isActive) ||
      (filter === 'inactive' && !c.isActive) ||
      (filter === 'no-gate' && !c.gateId);
    return matchSearch && matchFilter;
  });

  // Computed stats
  const totalActive = controllers.filter((c) => c.isActive).length;
  const totalScansToday = controllers.reduce(
    (s, c) => s + c.totalScansToday,
    0,
  );
  const assigned = controllers.filter((c) => c.gateId).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Dot pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Shield size={14} className="text-brand" strokeWidth={2} />
              <span className="text-xs text-title font-semibold tracking-[0.08em] uppercase">
                Administration
              </span>
            </div>
            <h1 className="font-title text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              Gestion des contrôleurs
            </h1>
            <p className="text-muted text-sm mt-1">
              {controllers.length} contrôleur
              {controllers.length !== 1 ? 's' : ''} enregistré
              {controllers.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-foreground/8 bg-surface text-muted hover:text-foreground hover:border-foreground/20 transition-all active:scale-95 disabled:opacity-40"
            >
              <RefreshCw
                size={15}
                strokeWidth={2}
                className={refreshing ? 'animate-spin' : ''}
              />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-btn text-background font-title font-semibold text-[14px] shadow-[0_4px_16px_rgba(34,197,94,0.2)] hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <Plus size={16} strokeWidth={2.5} />
              Nouveau contrôleur
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={Users}
            label="Total contrôleurs"
            value={controllers.length}
            color="brand"
          />
          <StatCard
            icon={Activity}
            label="Actifs maintenant"
            value={totalActive}
            color="btn"
            accent
          />
          <StatCard
            icon={ScanLine}
            label="Scans aujourd'hui"
            value={totalScansToday}
            color="brand"
          />
          <StatCard
            icon={DoorOpen}
            label="Portes assignées"
            value={`${assigned}/${controllers.length}`}
            color="title"
          />
        </div>

        {/* ── Sync status ── */}
        <div
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs mb-5 w-fit
          ${error ? 'bg-error/10 border border-error/20 text-error' : 'bg-btn/[0.08] border border-btn/20 text-btn'}`}
        >
          {error ? (
            <WifiOff size={12} strokeWidth={2} />
          ) : (
            <Wifi size={12} strokeWidth={2} />
          )}
          {error
            ? 'Synchronisation échouée'
            : 'Mis à jour automatiquement toutes les 30s'}
        </div>

        {/* ── Search & filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search
              size={15}
              strokeWidth={2}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Rechercher un contrôleur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface border border-foreground/10 text-foreground text-[13px] placeholder:text-muted/50 outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {(
              [
                { key: 'all', label: 'Tous' },
                { key: 'active', label: 'Actifs' },
                { key: 'inactive', label: 'Inactifs' },
                { key: 'no-gate', label: 'Sans porte' },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3.5 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap border transition-all
                  ${
                    filter === key
                      ? 'bg-brand/10 border-brand/30 text-brand'
                      : 'bg-surface border-foreground/10 text-muted hover:text-foreground hover:border-foreground/20'
                  }`}
              >
                {label}
                {key === 'all' && ` (${controllers.length})`}
                {key === 'active' && ` (${totalActive})`}
                {key === 'inactive' && ` (${controllers.length - totalActive})`}
                {key === 'no-gate' && ` (${controllers.length - assigned})`}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-surface border border-foreground/5 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-error/10 border border-error/25 text-error text-sm">
            <AlertTriangle size={18} strokeWidth={1.8} className="shrink-0" />
            {error}
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface border border-foreground/8 flex items-center justify-center mb-4">
              <Users
                size={28}
                className="text-muted opacity-50"
                strokeWidth={1.5}
              />
            </div>
            <p className="font-title font-semibold text-foreground/40 text-[15px] mb-1">
              {search ? 'Aucun résultat' : 'Aucun contrôleur'}
            </p>
            <p className="text-muted text-sm">
              {search
                ? `Aucun résultat pour "${search}"`
                : 'Créez votre premier contrôleur'}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((c) => (
              <ControllerRow
                key={c.id}
                controller={c}
                gates={gates}
                onAssignGate={handleAssignGate}
                onUnassignGate={handleUnassignGate}
                onDelete={(id) =>
                  setDeleteTarget(controllers.find((x) => x.id === id) ?? null)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          controller={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

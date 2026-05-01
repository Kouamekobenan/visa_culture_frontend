'use client';
import { useState, useEffect } from 'react';
import { ControllerRepository } from '../module/controller/infrastructure/controllerProfile.repository';
import { EventDay, IGates } from '../module/controller/domain/entites/entity';
import { formatDateTime } from '../../utils/types/conversion.data';
import {
  Calendar,
  MapPin,
  Ticket,
  DoorOpen,
  CheckCircle2,
  ChevronDown,
  CheckCheck,
  AlertCircle,
  ArrowRight,
  Wifi,
} from 'lucide-react';

const controllerService = new ControllerRepository();

// ─── Types ────────────────────────────────────────────────────────────────────

interface GateSelectorProps {
  gates: IGates[];
  selectedGateId: string | null;
  onSelect: (id: string) => void;
  assigning: boolean;
  assigned: string | null;
}

interface EventCardProps {
  event: EventDay;
  isExpanded: boolean;
  onToggle: () => void;
  onAssignGate: (gateId: string, eventId: string) => Promise<void>;
  assignedGateId: string | null;
  assignedEventId: string | null;
}

interface TodayEventsControllerProps {
  controllerId: string;
}

// ─── GateSelector ─────────────────────────────────────────────────────────────

function GateSelector({
  gates,
  selectedGateId,
  onSelect,
  assigning,
  assigned,
}: GateSelectorProps) {
  if (!gates || gates.length === 0) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-muted">
        <AlertCircle size={14} strokeWidth={1.8} />
        Aucune porte disponible pour cet événement.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {gates.map((gate: IGates) => {
        const isSelected = selectedGateId === gate.id;
        const isAssigned = assigned === gate.id;
        return (
          <button
            key={gate.id}
            onClick={() => onSelect(gate.id)}
            disabled={assigning}
            className={`
              flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px]
              border transition-all duration-200 outline-none font-[inherit]
              ${
                isSelected
                  ? 'border-brand/50 bg-brand/10 text-brand font-medium shadow-[0_0_12px_rgba(13,148,136,0.15)]'
                  : 'border-foreground/10 bg-surface text-muted hover:border-foreground/20 hover:text-foreground'
              }
              ${assigning ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            <DoorOpen size={13} strokeWidth={1.8} />
            {gate.name}
            {isAssigned && (
              <span className="text-btn flex items-center ml-0.5">
                <CheckCircle2 size={13} strokeWidth={2.5} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── EventCard ────────────────────────────────────────────────────────────────

function EventCard({
  event,
  isExpanded,
  onToggle,
  onAssignGate,
  assignedGateId,
  assignedEventId,
}: EventCardProps) {
  const [selectedGate, setSelectedGate] = useState<string | null>(
    assignedGateId ?? null,
  );
  const [localAssigning, setLocalAssigning] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isThisEventAssigned: boolean = assignedEventId === event.id;

  async function handleAssign(): Promise<void> {
    if (!selectedGate) return;
    setLocalAssigning(true);
    setError(null);
    try {
      await onAssignGate(selectedGate, event.id);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setLocalAssigning(false);
    }
  }

  return (
    <div
      className={`
        rounded-2xl overflow-hidden transition-all duration-200
        ${
          isThisEventAssigned
            ? 'bg-btn/[0.06] border border-btn/30 shadow-[0_0_20px_rgba(34,197,94,0.06)]'
            : isExpanded
              ? 'bg-surface border border-foreground/10 shadow-lg'
              : 'bg-surface border border-foreground/5 hover:border-foreground/10'
        }
      `}
    >
      {/* Card header */}
      <div
        onClick={onToggle}
        className="flex items-center gap-4 p-4 sm:p-5 cursor-pointer group"
      >
        {/* Event image / placeholder */}
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl shrink-0 flex items-center justify-center border border-foreground/8 overflow-hidden"
          style={{
            background: event.imageUrl
              ? `url(${event.imageUrl}) center/cover`
              : 'linear-gradient(135deg, rgba(13,148,136,0.2) 0%, rgba(13,148,136,0.05) 100%)',
          }}
        >
          {!event.imageUrl && (
            <Calendar
              size={22}
              className="text-brand opacity-60"
              strokeWidth={1.5}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="font-title font-bold text-foreground text-[15px] sm:text-[16px] truncate">
              {event.title}
            </h3>
            {isThisEventAssigned && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-btn bg-btn/10 border border-btn/25 rounded-full px-2.5 py-0.5 whitespace-nowrap">
                <CheckCircle2 size={10} strokeWidth={2.5} />
                Assigné
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <Calendar size={11} strokeWidth={2} />
              {formatDateTime(event.date)}
            </span>
            {event.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={11} strokeWidth={2} />
                {event.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Ticket size={11} strokeWidth={2} />
              {event.totalTickets} ticket{event.totalTickets !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <DoorOpen size={11} strokeWidth={2} />
              {event.gates?.length ?? 0} porte
              {(event.gates?.length ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <div
          className={`shrink-0 text-muted transition-all duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'} group-hover:text-foreground`}
        >
          <ChevronDown size={16} strokeWidth={2} />
        </div>
      </div>

      {/* Expanded panel */}
      {isExpanded && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-4 border-t border-foreground/[0.06]">
          <p className="text-[10px] font-bold text-muted uppercase tracking-[0.1em] mb-3">
            Choisir une porte
          </p>

          <GateSelector
            gates={event.gates ?? []}
            selectedGateId={selectedGate}
            onSelect={setSelectedGate}
            assigning={localAssigning}
            assigned={isThisEventAssigned ? assignedGateId : null}
          />

          {error && (
            <div className="flex items-center gap-1.5 mt-3 text-[13px] text-error">
              <AlertCircle size={13} strokeWidth={2} />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-1.5 mt-3 text-[13px] text-btn">
              <CheckCheck size={14} strokeWidth={2.5} />
              Porte assignée avec succès
            </div>
          )}

          <button
            onClick={handleAssign}
            disabled={!selectedGate || localAssigning}
            className={`
              mt-4 w-full py-3 rounded-xl text-[14px] font-semibold
              tracking-[0.01em] transition-all duration-200 border-none font-[inherit]
              flex items-center justify-center gap-2
              ${
                selectedGate && !localAssigning
                  ? 'bg-btn text-background cursor-pointer hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] shadow-[0_4px_16px_rgba(34,197,94,0.2)]'
                  : 'bg-foreground/5 text-muted cursor-not-allowed'
              }
            `}
          >
            {localAssigning ? (
              <>
                <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Assignation en cours...
              </>
            ) : (
              <>
                <CheckCircle2 size={15} strokeWidth={2} />
                Confirmer la porte
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="h-[88px] rounded-2xl bg-surface border border-foreground/5 animate-pulse" />
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface border border-foreground/8 flex items-center justify-center mb-4">
        <Calendar
          size={28}
          className="text-muted opacity-50"
          strokeWidth={1.5}
        />
      </div>
      <p className="font-title font-semibold text-foreground/40 text-[15px] mb-1">
        Aucun événement prévu aujourd&apos;hui
      </p>
      <p className="text-muted text-sm">
        Revenez plus tard ou contactez l&apos;organisateur
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TodayEventsController({
  controllerId,
}: TodayEventsControllerProps) {
  const [events, setEvents] = useState<EventDay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assignedGateId, setAssignedGateId] = useState<string | null>(null);
  const [assignedEventId, setAssignedEventId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDataEvent = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const result: EventDay[] = await controllerService.getEventDay();
        setEvents(result);
        if (result.length === 1) setExpandedId(result[0].id);
      } catch (e: unknown) {
        const message =
          e instanceof Error
            ? e.message
            : 'Erreur lors du chargement des événements';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchDataEvent();
  }, [controllerId]);

  async function handleAssignGate(
    gateId: string,
    eventId: string,
  ): Promise<void> {
    await controllerService.assigneGate(controllerId, { gateId });
    setAssignedGateId(gateId);
    setAssignedEventId(eventId);
  }

  const assignedGateName: string =
    events
      .find((e: EventDay) => e.id === assignedEventId)
      ?.gates?.find((g: IGates) => g.id === assignedGateId)?.name ??
    'une porte';

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle dot pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── Two-column layout on lg+ ── */}
      <div className="relative min-h-screen flex flex-col lg:flex-row">
        {/* ── LEFT SIDEBAR (desktop only sticky panel) ── */}
        <aside
          className="
          lg:w-[320px] xl:w-[360px] shrink-0
          lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto
          lg:flex lg:flex-col lg:justify-between
          bg-surface border-b lg:border-b-0 lg:border-r border-foreground/5
          px-6 py-7 lg:px-8 lg:py-10
        "
        >
          <div>
            {/* Live indicator */}
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-btn animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
              <span className="text-xs text-btn font-semibold tracking-[0.08em] uppercase">
                Aujourd&apos;hui
              </span>
            </div>

            <h1 className="font-title text-2xl lg:text-[28px] font-bold text-foreground leading-tight mb-2">
              Événements
              <br className="hidden lg:block" /> du jour
            </h1>
            <p className="text-muted text-sm mb-7">
              Sélectionnez un événement et assignez-vous à une porte pour
              démarrer le contrôle.
            </p>

            {/* Quick stats */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background border border-foreground/8">
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                  <Calendar size={14} className="text-brand" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[10px] text-muted uppercase tracking-[0.08em] font-semibold">
                    Événements
                  </p>
                  <p className="text-foreground font-bold text-[15px] font-title leading-tight">
                    {loading
                      ? '—'
                      : `${events.length} programmé${events.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background border border-foreground/8">
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                  <DoorOpen size={14} className="text-brand" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[10px] text-muted uppercase tracking-[0.08em] font-semibold">
                    Portes
                  </p>
                  <p className="text-foreground font-bold text-[15px] font-title leading-tight">
                    {loading
                      ? '—'
                      : `${events.reduce((acc, e) => acc + (e.gates?.length ?? 0), 0)} disponibles`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned block — desktop */}
          {assignedGateId && (
            <div className="hidden lg:block mt-8 space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-btn/[0.08] border border-btn/25">
                <div className="w-9 h-9 rounded-xl bg-btn/15 flex items-center justify-center shrink-0">
                  <CheckCircle2
                    size={17}
                    className="text-btn"
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <p className="text-[11px] text-muted font-medium mb-0.5">
                    Vous êtes assigné à
                  </p>
                  <p className="font-title font-bold text-btn text-[15px] leading-tight">
                    {assignedGateName}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  (window.location.href = `/frontend/controler/page/dashboard/${controllerId}`)
                }
                className="
                  w-full flex items-center justify-center gap-2
                  py-3.5 rounded-2xl
                  bg-btn text-background
                  font-title font-bold text-[14px]
                  shadow-[0_8px_24px_rgba(34,197,94,0.25)]
                  hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]
                  transition-all duration-200
                "
              >
                Accéder au dashboard
                <ArrowRight size={15} strokeWidth={2.5} />
              </button>
              <div className="flex items-center gap-1.5 text-xs text-muted justify-center pt-1">
                <Wifi size={11} strokeWidth={2} />
                Synchronisation automatique
              </div>
            </div>
          )}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10 pb-28 lg:pb-10 overflow-y-auto">
          <div className="max-w-2xl mx-auto lg:max-w-3xl">
            {/* Assigned pill — mobile */}
            {assignedGateId && (
              <div className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-xl bg-btn/[0.08] border border-btn/25 mb-5 text-[13px] text-btn">
                <CheckCircle2 size={14} strokeWidth={2.5} />
                <span>
                  Assigné à <strong>{assignedGateName}</strong>
                </span>
              </div>
            )}

            {/* Section title (desktop) */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <h2 className="font-title font-bold text-foreground text-xl">
                {loading
                  ? 'Chargement...'
                  : events.length === 0
                    ? 'Aucun événement'
                    : `${events.length} événement${events.length !== 1 ? 's' : ''} disponible${events.length !== 1 ? 's' : ''}`}
              </h2>
              {!loading && events.length > 0 && (
                <span className="text-xs text-muted bg-surface border border-foreground/8 px-3 py-1.5 rounded-full">
                  Cliquez pour sélectionner une porte
                </span>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col gap-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-error/10 border border-error/25 text-error text-[14px]">
                <AlertCircle size={18} strokeWidth={1.8} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Empty */}
            {!loading && !error && events.length === 0 && <EmptyState />}

            {/* Events list */}
            {!loading && !error && events.length > 0 && (
              <div className="flex flex-col gap-3">
                {events.map((event: EventDay) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isExpanded={expandedId === event.id}
                    onToggle={() =>
                      setExpandedId(expandedId === event.id ? null : event.id)
                    }
                    onAssignGate={handleAssignGate}
                    assignedGateId={assignedGateId}
                    assignedEventId={assignedEventId}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Fixed bottom CTA (mobile only) ── */}
      {assignedGateId && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent">
          <button
            onClick={() =>
              (window.location.href = `/frontend/controler/page/dashboard/${controllerId}`)
            }
            className="
              w-full flex items-center justify-between
              px-5 py-4 rounded-2xl
              bg-btn text-background
              font-title font-bold text-[15px]
              shadow-[0_8px_32px_rgba(34,197,94,0.3)]
              hover:shadow-[0_12px_40px_rgba(34,197,94,0.4)]
              hover:scale-[1.01] active:scale-[0.99]
              transition-all duration-200
            "
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-background/20 flex items-center justify-center">
                <CheckCircle2 size={18} strokeWidth={2} />
              </div>
              Accéder au dashboard
            </div>
            <ArrowRight size={18} strokeWidth={2.5} className="opacity-70" />
          </button>
        </div>
      )}
    </div>
  );
}

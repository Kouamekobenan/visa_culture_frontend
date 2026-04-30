'use client';
import { useState, useEffect } from 'react';
import { ControllerRepository } from '../module/controller/infrastructure/controllerProfile.repository';
import { EventDay, IGates } from '../module/controller/domain/entites/entity';
import { formatDateTime } from '../../utils/types/conversion.data';

const controllerService = new ControllerRepository();

// ─── Icons ────────────────────────────────────────────────────────────────────
function CalendarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function TicketIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
    </svg>
  );
}

function DoorIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 4h3a2 2 0 0 1 2 2v14" />
      <path d="M2 20h3" />
      <path d="M13 20h9" />
      <path d="M10 12v.01" />
      <path d="M13 4l-6 2v14l6 2V4Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChevronIcon({ rotated }: { rotated: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${rotated ? 'rotate-180' : 'rotate-0'}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

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
      <p className="py-3 text-sm text-[#8c8880]">
        Aucune porte disponible pour cet événement.
      </p>
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
              flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] 
              border transition-all duration-200 outline-none font-[inherit]
              ${
                isSelected
                  ? 'border-[#2a6b4f] bg-[rgba(42,107,79,0.18)] text-[#5dcaa5] font-medium'
                  : 'border-white/10 bg-white/5 text-[#c2bfb6] font-normal'
              }
              ${assigning ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-white/20'}
            `}
          >
            <DoorIcon />
            {gate.name}
            {isAssigned && (
              <span className="text-[#5dcaa5] flex items-center">
                <CheckIcon />
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
        rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer
        ${
          isThisEventAssigned
            ? 'bg-white/[0.07] border border-[rgba(93,202,165,0.4)]'
            : isExpanded
              ? 'bg-white/[0.07] border border-white/[0.15]'
              : 'bg-white/[0.04] border border-white/[0.07]'
        }
      `}
    >
      {/* Card header */}
      <div onClick={onToggle} className="flex items-start gap-3.5 p-4">
        {/* Event image or placeholder */}
        <div
          className="w-13 h-13 rounded-xl shrink-0 flex items-center justify-center border border-white/10"
          style={{
            width: 52,
            height: 52,
            background: event.imageUrl
              ? `url(${event.imageUrl}) center/cover`
              : 'linear-gradient(135deg, #1a4d38 0%, #0e2d20 100%)',
          }}
        >
          {!event.imageUrl && (
            <span className="text-[#5dcaa5] opacity-70">
              <CalendarIcon />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="m-0 text-[15px] font-semibold text-[#f0ede6] truncate">
              {event.title}
            </h3>
            {isThisEventAssigned && (
              <span className="text-[11px] font-medium text-[#5dcaa5] bg-[rgba(93,202,165,0.15)] border border-[rgba(93,202,165,0.3)] rounded-full px-2 py-0.5 whitespace-nowrap">
                Assigné
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5 text-xs text-[#8c8880]">
            <span className="flex items-center gap-1">
              <CalendarIcon />
              {formatDateTime(event.date)}
            </span>
            {event.location && (
              <span className="flex items-center gap-1">
                <PinIcon />
                {event.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <TicketIcon />
              {event.totalTickets} ticket{event.totalTickets !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <DoorIcon />
              {event.gates?.length ?? 0} porte
              {(event.gates?.length ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <div className="text-[#5c5a55] shrink-0 mt-0.5">
          <ChevronIcon rotated={isExpanded} />
        </div>
      </div>

      {/* Expanded panel */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-4 border-t border-white/[0.06]">
          <p className="m-0 mb-2.5 text-xs text-[#8c8880] font-medium tracking-widest uppercase">
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
            <p className="mt-2.5 text-[13px] text-[#e24b4a]">{error}</p>
          )}

          {success && (
            <div className="flex items-center gap-1.5 mt-2.5 text-[#5dcaa5] text-[13px]">
              <CheckIcon />
              Porte assignée avec succès
            </div>
          )}

          <button
            onClick={handleAssign}
            disabled={!selectedGate || localAssigning}
            className={`
              mt-3.5 w-full py-3 rounded-xl text-[14px] font-semibold 
              tracking-[0.01em] transition-all duration-200 font-[inherit] border-none
              ${
                selectedGate && !localAssigning
                  ? 'bg-gradient-to-br from-[#1d9e75] to-[#0f6e56] text-white cursor-pointer hover:opacity-90'
                  : 'bg-white/[0.06] text-[#5c5a55] cursor-not-allowed'
              }
            `}
          >
            {localAssigning ? 'Assignation en cours...' : 'Confirmer la porte'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="h-[84px] rounded-2xl bg-white/[0.04] border border-white/[0.07] animate-pulse" />
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

  async function handleAssignGate(gateId: string): Promise<void> {
    await controllerService.assigneGate(controllerId, { gateId });
    setAssignedGateId(gateId);
    // setAssignedEventId(controlerId);
  }

  const assignedGateName: string =
    events
      .find((e: EventDay) => e.id === assignedEventId)
      ?.gates?.find((g: IGates) => g.id === assignedGateId)?.name ??
    'une porte';
  return (
    <div className="min-h-screen bg-[#0d1710] font-['DM_Sans','Helvetica_Neue',sans-serif] px-4 py-6 max-w-[520px] mx-auto box-border">
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-[#1d9e75] shadow-[0_0_8px_#1d9e75]" />
          <span className="text-xs text-[#5dcaa5] font-medium tracking-[0.08em] uppercase">
            Aujourd&apos;hui
          </span>
        </div>
        <h1 className="m-0 text-[26px] font-bold text-[#f0ede6] tracking-[-0.02em]">
          Événements du jour
        </h1>
        <p className="mt-1.5 text-[14px] text-[#6b6860] m-0">
          Sélectionnez un événement et assignez-vous à une porte
        </p>
      </div>
      {/* Assigned pill */}
      {assignedGateId && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[rgba(29,158,117,0.12)] border border-[rgba(29,158,117,0.3)] mb-4 text-[13px] text-[#5dcaa5]">
          <CheckIcon />
          <span>
            Vous êtes assigné à <strong>{assignedGateName}</strong>
          </span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="px-4 py-3.5 rounded-xl bg-[rgba(226,75,74,0.1)] border border-[rgba(226,75,74,0.3)] text-[#e24b4a] text-[14px]">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && events.length === 0 && (
        <div className="text-center py-12 text-[#4a4844]">
          <div className="text-[40px] mb-3 opacity-40 flex justify-center">
            <CalendarIcon />
          </div>
          <p className="m-0 text-[15px]">
            Aucun événement prévu aujourd&apos;hui
          </p>
        </div>
      )}

      {/* Events list */}
      {!loading && !error && events.length > 0 && (
        <div className="flex flex-col gap-2.5">
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
      {/* CTA dashboard */}
      {assignedGateId && (
        <button
          onClick={() => (window.location.href = '/controller/dashboard')}
          className="mt-6 w-full py-3.5 rounded-xl border border-[rgba(93,202,165,0.3)] bg-[rgba(93,202,165,0.08)] text-[#5dcaa5] text-[15px] font-semibold cursor-pointer font-[inherit] tracking-[0.01em] transition-all duration-200 hover:bg-[rgba(93,202,165,0.14)]"
        >
          Accéder au dashboard →
        </button>
      )}
    </div>
  );
}

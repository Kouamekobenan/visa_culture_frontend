'use client';

import { EventService } from '@/app/frontend/module/event/application/event.service';
import { Event } from '@/app/frontend/module/event/domain/entities/event.entity';
import { EventRepository } from '@/app/frontend/module/event/infrastructure/event.repository';
import ThemeToggle from '@/app/frontend/components/ui/ThemeToggle';
import { ArrowRight, Command, Loader2, Search, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {  useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';

const eventRepo = new EventRepository();
const eventService = new EventService(eventRepo);

const MAX_RESULTS = 6;
const MIN_QUERY_LEN = 2;
const RECENT_KEY = 'admin_recent_searches';
// const MAX_RECENT = 5;

type EventStatus = 'live' | 'upcoming' | 'ended';

const STATUS_CONFIG: Record<EventStatus, { label: string; cls: string }> = {
  live: {
    label: '● LIVE',
    cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20',
  },
  upcoming: {
    label: 'À VENIR',
    cls: 'bg-brand/10 text-brand ring-1 ring-brand/20',
  },
  ended: {
    label: 'TERMINÉ',
    cls: 'bg-muted/10 text-muted ring-1 ring-muted/20',
  },
};

// Helper pour le highlight avec ta couleur Brand
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-brand font-bold uppercase tracking-tight">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function AdminSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQ] = useDebounce(query, 280);
  const [results, setResults] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [recents, setRecents] = useState<string[]>([]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(RECENT_KEY);
    if (saved) setRecents(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (debouncedQ.length < MIN_QUERY_LEN) {
      setResults([]);
      setOpen(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await eventService.searchByTitle(debouncedQ);
        if (!cancelled) {
          setResults(res.slice(0, MAX_RESULTS));
          setOpen(true);
          setActiveIdx(-1);
        }
      } catch (err) {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQ]);

  // Fermeture au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeIdx >= 0 && results[activeIdx]) {
        router.push(
          `/frontend/admin/page/events/edit/${results[activeIdx].id}`,
        );
        setOpen(false);
      }
    }
  };

  return (
    <div
      ref={wrapRef}
      className="relative w-full max-w-2xl flex items-center gap-3"
    >
      <div className="relative flex-1 group ">
        {/* Loupe avec padding ajusté */}
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors text-muted group-focus-within:text-brand">
          {loading ? (
            <Loader2 size={18} className="animate-spin text-brand" />
          ) : (
            <Search size={18} />
          )}
        </span>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher un événement..."
          className="h-12 px-3 w-full rounded-2xl bg-surface border border-muted/20 text-foreground placeholder:text-muted/50 pl-12 pr-24 outline-none transition-all duration-300 focus:ring-2 focus:ring-brand/30 focus:border-brand shadow-sm"
        />

        {/* Shortcut KBD */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query.length > 0 ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full bg-muted/10 text-muted hover:bg-brand/20 hover:text-brand transition-colors"
            >
              <X size={14} />
            </button>
          ) : (
            <kbd className="hidden sm:flex items-center gap-1 rounded-md border border-muted/20 bg-background px-2 py-1 font-sans text-[10px] text-muted shadow-sm">
              <Command size={10} /> K
            </kbd>
          )}
        </span>
        {/* Dropdown adaptable au thème */}
        {open && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 overflow-hidden rounded-2xl border border-muted/20 bg-background shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-muted/10 bg-surface/50 px-4 py-3">
              <span className="font-title text-[10px] tracking-widest text-muted uppercase font-bold">
                Résultats
              </span>
              <span className="text-[10px] font-bold text-brand">
                {results.length} trouvés
              </span>
            </div>
            <ul className="py-2 max-h-[400px] overflow-y-auto">
              {results.map((event, i) => (
                <li
                  key={event.id}
                  className={`${i === activeIdx ? 'bg-brand/5' : 'hover:bg-surface'} transition-colors`}
                >
                  <div
                    onClick={() =>
                      router.push(
                        `/frontend/admin/page/events/edit/${event.id}`,
                      )
                    }
                    className="flex items-center gap-4 px-4 py-3 cursor-pointer group"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-muted/10">
                      <Image
                        src={event.imageUrl}
                        fill
                        alt=""
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-title text-sm font-bold text-foreground truncate">
                        <Highlight text={event.title} query={query} />
                      </h4>
                      <p className="text-xs text-muted truncate">
                        {event.location}
                      </p>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-brand opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {/* Theme Toggle Button adaptatif */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-muted/20 bg-surface hover:border-brand hover:shadow-md transition-all cursor-pointer shadow-sm">
        <ThemeToggle />
      </div>
    </div>
  );
}

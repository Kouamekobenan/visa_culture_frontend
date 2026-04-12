// app/frontend/utils/date.utils.ts

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type ISODateString = string; // ex: "2025-04-12T20:00:00.000Z"

interface FormatOptions {
  showTime?: boolean; // afficher l'heure (ex: "à 20h00")
  showDayName?: boolean; // afficher le jour (ex: "samedi 12 avril 2025")
  showYear?: boolean; // masquer l'année si false (ex: "12 avril")
  relative?: boolean; // afficher "il y a X jours" si date récente
  relativeThresholdDays?: number; // nb de jours avant de basculer en absolu (défaut: 7)
}

// ─────────────────────────────────────────────────────────────
// Locale FR de référence
// ─────────────────────────────────────────────────────────────

const LOCALE = "fr-FR";

const TIMEZONE = "Africa/Abidjan"; // UTC+0 — adapte si besoin (ex: "Europe/Paris")

// ─────────────────────────────────────────────────────────────
// Fonction principale
// ─────────────────────────────────────────────────────────────

/**
 * Convertit une date ISO 8601 en chaîne lisible en français.
 *
 * @param iso  - La date brute venant de la BDD (ex: "2025-04-12T20:00:00.000Z")
 * @param opts - Options d'affichage (heure, jour, année, relatif...)
 * @returns    - Chaîne formatée (ex: "12 avril 2025")
 *
 * @example
 * formatDate("2025-04-12T20:00:00.000Z")
 * // → "12 avril 2025"
 *
 * formatDate("2025-04-12T20:00:00.000Z", { showTime: true })
 * // → "12 avril 2025 à 20h00"
 *
 * formatDate("2025-04-12T20:00:00.000Z", { showDayName: true })
 * // → "samedi 12 avril 2025"
 *
 * formatDate("2025-04-10T10:00:00.000Z", { relative: true })
 * // → "il y a 2 jours"
 */
export function formatDate(
  iso: ISODateString,
  opts: FormatOptions = {},
): string {
  if (!iso) return "—";

  const {
    showTime = false,
    showDayName = false,
    showYear = true,
    relative = false,
    relativeThresholdDays = 7,
  } = opts;

  let date: Date;

  try {
    date = new Date(iso);
    if (isNaN(date.getTime())) throw new Error("Invalid date");
  } catch {
    console.warn(`[formatDate] Date invalide reçue : "${iso}"`);
    return "Date invalide";
  }

  // ── Mode relatif ──────────────────────────────────────────
  if (relative) {
    const diff = Date.now() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diff / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diff / (1000 * 60));
        if (diffMinutes <= 1) return "à l'instant";
        return `il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
      }
      return `il y a ${diffHours}h`;
    }

    if (diffDays < 0) {
      const futureDays = Math.abs(diffDays);
      if (futureDays === 1) return "demain";
      if (futureDays <= relativeThresholdDays)
        return `dans ${futureDays} jour${futureDays > 1 ? "s" : ""}`;
    }

    if (diffDays === 1) return "hier";
    if (diffDays <= relativeThresholdDays)
      return `il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;

    // Au-delà du seuil → fallback en absolu
  }

  // ── Mode absolu ───────────────────────────────────────────
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: showYear ? "numeric" : undefined,
    weekday: showDayName ? "long" : undefined,
    timeZone: TIMEZONE,
  };

  let result = date.toLocaleDateString(LOCALE, dateOptions);

  if (showTime) {
    const timeStr = date
      .toLocaleTimeString(LOCALE, {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: TIMEZONE,
      })
      .replace(":", "h"); // "20:00" → "20h00"

    result += ` à ${timeStr}`;
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// Raccourcis prêts à l'emploi
// ─────────────────────────────────────────────────────────────

/** "12 avril 2025" */
export const formatShortDate = (iso: ISODateString) => formatDate(iso);

/** "12 avril 2025 à 20h00" */
export const formatDateTime = (iso: ISODateString) =>
  formatDate(iso, { showTime: true });

/** "samedi 12 avril 2025" */
export const formatFullDate = (iso: ISODateString) =>
  formatDate(iso, { showDayName: true });

/** "samedi 12 avril 2025 à 20h00" */
export const formatFullDateTime = (iso: ISODateString) =>
  formatDate(iso, { showDayName: true, showTime: true });

/** "12 avril" (sans année) */
export const formatShortDateNoYear = (iso: ISODateString) =>
  formatDate(iso, { showYear: false });

/** "il y a 2 jours" ou "12 avril 2025" si > 7 jours */
export const formatRelativeDate = (iso: ISODateString, thresholdDays = 7) =>
  formatDate(iso, { relative: true, relativeThresholdDays: thresholdDays });

// ─────────────────────────────────────────────────────────────
// Utilitaires supplémentaires
// ─────────────────────────────────────────────────────────────

/** Vérifie si une date ISO est dans le passé */
export function isPastDate(iso: ISODateString): boolean {
  return new Date(iso).getTime() < Date.now();
}

/** Vérifie si une date ISO est dans le futur */
export function isFutureDate(iso: ISODateString): boolean {
  return new Date(iso).getTime() > Date.now();
}

/** Vérifie si une date ISO est aujourd'hui */
export function isToday(iso: ISODateString): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

/** Retourne le nombre de jours restants avant une date future */
export function daysUntil(iso: ISODateString): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/** Formate une durée entre deux dates ISO → "2h30" ou "3 jours" */
export function formatDuration(
  startIso: ISODateString,
  endIso: ISODateString,
): string {
  const diff = new Date(endIso).getTime() - new Date(startIso).getTime();
  if (diff <= 0) return "—";

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (totalDays >= 1) return `${totalDays} jour${totalDays > 1 ? "s" : ""}`;
  if (totalHours >= 1) {
    const remainingMinutes = totalMinutes % 60;
    return remainingMinutes > 0
      ? `${totalHours}h${String(remainingMinutes).padStart(2, "0")}`
      : `${totalHours}h`;
  }
  return `${totalMinutes} min`;
}


// USE FUNCTION

/**
 * import {
  formatShortDate,
  formatDateTime,
  formatFullDateTime,
  formatRelativeDate,
  formatShortDateNoYear,
  formatDuration,
  isPastDate,
  isFutureDate,
  daysUntil,
  isToday,
} from "@/app/frontend/utils/date.utils";

// ── Carte événement ──────────────────────────────────────────
<p>{formatShortDate(event.date)}</p>
// → "12 avril 2025"

<p>{formatDateTime(event.date)}</p>
// → "12 avril 2025 à 20h00"

<p>{formatFullDateTime(event.startDate)}</p>
// → "samedi 12 avril 2025 à 20h00"

// ── Notifications / feed ────────────────────────────────────
<span>{formatRelativeDate(event.createdAt)}</span>
// → "il y a 3 jours" ou "12 avril 2025" si > 7j

// ── Badge "J-X" ─────────────────────────────────────────────
{isFutureDate(event.date) && (
  <span>J-{daysUntil(event.date)}</span>
)}
// → "J-5"

// ── Badge "Terminé" ─────────────────────────────────────────
{isPastDate(event.date) && <span>Terminé</span>}

// ── Durée d'un événement ────────────────────────────────────
<p>{formatDuration(event.startDate, event.endDate)}</p>
// → "2h30" ou "3 jours"

// ── Affichage conditionnel "Aujourd'hui" ────────────────────
{isToday(event.date) && <span>Aujourd'hui</span>}
 */
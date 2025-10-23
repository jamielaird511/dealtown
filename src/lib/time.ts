// src/lib/time.ts

// Returns a Date object representing "now" in the given IANA time zone
// by round-tripping through a localized string (works in Node runtimes).
export function getZonedDate(tz: string, d: Date = new Date()): Date {
  const localized = d.toLocaleString('en-US', { timeZone: tz });
  return new Date(localized);
}

// Day-of-week in the given IANA time zone.
// Matches JS getDay(): 0 = Sunday, ... 6 = Saturday.
export function getDowInZone(tz: string, d: Date = new Date()): number {
  return getZonedDate(tz, d).getDay();
}

/**
 * Accepts "HH:mm" or "HH:mm:ss" and returns "h:mmam/pm".
 * Falls back to the original string if the format is unexpected.
 */
export function to12h(time?: string | null) {
  if (!time) return null;

  const t = String(time).trim();

  // Match 24h "H:mm" or "HH:mm" or "HH:mm:ss"
  // 1: hours, 2: minutes, 3: optional seconds
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(t);
  if (!m) return t; // leave it unchanged if it's some other format

  let h = parseInt(m[1], 10);
  const min = m[2];
  const am = h < 12 || h === 24;

  if (h === 0) h = 12;
  if (h > 12) h -= 12;

  return `${h}:${min}${am ? "am" : "pm"}`;
}

/**
 * Render a range like "11:00am — 3:00pm".
 * Accepts start/end as "HH:mm" or "HH:mm:ss".
 */
export function renderTimeRange(start?: string | null, end?: string | null) {
  const s = to12h(start);
  const e = to12h(end);
  if (s && e) return `${s} — ${e}`;
  if (s) return s;
  if (e) return e;
  return null;
}
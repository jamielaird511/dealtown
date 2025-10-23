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

// Human-readable "time ago" for timestamps.
// Accepts Date | string | number (ms since epoch).
export function timeAgo(input: Date | string | number): string {
  const d = input instanceof Date ? input : new Date(input);
  const diffMs = Date.now() - d.getTime();
  if (!isFinite(diffMs)) return "";

  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;

  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;

  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

// Boolean helper: is the timestamp older than 48 hours?
export function isOlderThan48h(input: Date | string | number): boolean {
  const d = input instanceof Date ? input : new Date(input);
  return Date.now() - d.getTime() > 48 * 60 * 60 * 1000;
}
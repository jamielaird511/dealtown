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
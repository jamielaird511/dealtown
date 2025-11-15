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

// Format "HH:mm" or "HH:mm:ss" to 12-hour (e.g., "15:00:00" -> "3:00pm")
export function format12h(hms: string | null | undefined): string | null {
  if (!hms) return null;
  const [hStr, mStr = "00"] = hms.split(":"); // ignore seconds if present
  let h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;

  const suffix = h >= 12 ? "pm" : "am";
  h = h % 12;
  if (h === 0) h = 12;
  const mm = m.toString().padStart(2, "0");
  return `${h}:${mm}${suffix}`;
}

// Render a time range like "3:00pm – 5:00pm". Falls back gracefully.
export function renderTimeRange(
  start?: string | null,
  end?: string | null
): string | null {
  const s = format12h(start ?? null);
  const e = format12h(end ?? null);
  if (s && e) return `${s} – ${e}`;
  if (s) return s;
  if (e) return e;
  return null;
}

/**
 * Time helper functions for filtering deals by time windows
 */

/**
 * Get current time as HH:mm string (24-hour format)
 */
export function getCurrentTime24(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Get current ISO weekday (1=Mon, 7=Sun)
 */
export function getCurrentIsoWeekday(): number {
  const today = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  return today === 0 ? 7 : today; // Convert to ISO format
}

/**
 * Get current weekday as 0-based number (0=Sun, 1=Mon, ..., 6=Sat)
 */
export function getCurrentZeroBasedWeekday(): number {
  return new Date().getDay();
}

/**
 * Convert HH:mm time string to minutes since midnight for comparison
 */
export function timeToMinutes(timeStr: string | null | undefined): number | null {
  if (!timeStr) return null;
  const match = timeStr.match(/^(\d{2}):(\d{2})/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours * 60 + minutes;
}

/**
 * Check if current time is before 14:00 (2pm)
 */
export function isBefore2PM(): boolean {
  const now = new Date();
  return now.getHours() < 14;
}

/**
 * Check if current time is between start and end time (HH:mm format)
 */
export function isTimeBetween(startTime: string | null | undefined, endTime: string | null | undefined): boolean {
  if (!startTime || !endTime) return false;
  
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  if (startMinutes === null || endMinutes === null) return false;
  
  // Handle wrap-around (e.g., 22:00 - 02:00)
  if (endMinutes < startMinutes) {
    return nowMinutes >= startMinutes || nowMinutes <= endMinutes;
  }
  
  return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
}

/**
 * Check if a happy hour starts within the next N minutes
 */
export function startsWithinMinutes(startTime: string | null | undefined, minutes: number): boolean {
  if (!startTime) return false;
  
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = timeToMinutes(startTime);
  
  if (startMinutes === null) return false;
  
  // Calculate difference (handling day wrap-around)
  let diff = startMinutes - nowMinutes;
  if (diff < 0) {
    diff += 24 * 60; // Add a day's worth of minutes
  }
  
  return diff > 0 && diff <= minutes;
}

/**
 * Check if an array of days (0-based: 0=Sun, 1=Mon, ...) includes today
 */
export function includesToday(days: number[] | null | undefined): boolean {
  if (!days || days.length === 0) return true; // No days specified = every day
  const today = getCurrentZeroBasedWeekday();
  return days.includes(today);
}
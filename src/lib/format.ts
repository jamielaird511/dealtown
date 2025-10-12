/**
 * Format utilities for deal display
 */

const DayLabelBySlug: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const DayLabelByIndex = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Convert day (string slug or numeric 0-6) to formatted weekday name
 */
export function formatDayOfWeek(day: string | number): string {
  if (typeof day === "string") {
    const key = day.toLowerCase();
    return DayLabelBySlug[key] ?? day;
  }
  // Keep numeric support if some places still pass 0..6
  if (typeof day === "number" && day >= 0 && day <= 6) {
    return DayLabelByIndex[day];
  }
  return String(day);
}

/**
 * Format 24-hour time string (HH:mm) to 12-hour format (h:mm a)
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Format time range
 */
export function formatTimeRange(startTime?: string, endTime?: string): string {
  if (!startTime && !endTime) return "";
  if (startTime && endTime) {
    return `${formatTime(startTime)} – ${formatTime(endTime)}`;
  }
  if (startTime) return `from ${formatTime(startTime)}`;
  return `until ${formatTime(endTime!)}`;
}

/**
 * Format price from cents to dollar string
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Format dollars from cents with null handling
 */
export function formatDollarsFromCents(c?: number | null): string {
  if (c == null) return "";
  return `$${(c / 100).toFixed(2)}`;
}

/**
 * Label fuel product for display
 */
export function labelProduct(p: string): string {
  return p.toLowerCase() === "diesel" ? "Diesel" : p.toUpperCase();
}

/**
 * Build a schedule window string like "Fri 4:00 PM–6:00 PM"
 */
export function formatScheduleWindow(
  dayOfWeek?: number,
  startTime?: string,
  endTime?: string
): string {
  const parts: string[] = [];

  if (dayOfWeek !== undefined) {
    parts.push(formatDayOfWeek(dayOfWeek));
  }

  if (startTime || endTime) {
    parts.push(formatTimeRange(startTime, endTime));
  }

  return parts.join(" ");
}

/**
 * Format relative time (e.g., "12m ago", "2h ago", "3d ago")
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

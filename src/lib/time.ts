export const timeAgo = (iso: string) => {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export const isOlderThan48h = (iso: string) =>
  Date.now() - new Date(iso).getTime() > 48 * 3600 * 1000;

/**
 * Get day of week (0=Sun..6=Sat) in a specific IANA timezone.
 */
export function getDowInZone(tz: string): number {
  const fmt = new Intl.DateTimeFormat("en-NZ", {
    timeZone: tz,
    weekday: "short",
  });
  const dayName = fmt.format(new Date());
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[dayName] ?? 0;
}

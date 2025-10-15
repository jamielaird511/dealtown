export type DayKey = 'today'|'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun';
export const DAY_ORDER: DayKey[] = ['today','mon','tue','wed','thu','fri','sat','sun'];

// Short 3-letter keys the app uses everywhere.
export const DOW_ORDER = ["mon","tue","wed","thu","fri","sat","sun"] as const;
export type DOW = (typeof DOW_ORDER)[number];

// Human labels
export const DOW_LABELS: Record<DOW, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export function labelForDay(d: DayKey) {
  if (d === 'today') return 'Today';
  return d.charAt(0).toUpperCase() + d.slice(1);
}
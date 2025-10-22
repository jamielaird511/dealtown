import { ISO_WEEKDAY_LABELS, ISO_WEEKDAY_NUMBERS } from '@/lib/constants/weekdays';

/**
 * Converts various day formats to ISO weekday numbers (1=Mon, 7=Sun)
 * Handles backward compatibility with 0-based arrays
 */
export function normalizeToIsoWeekdays(days: unknown): number[] {
  if (!Array.isArray(days) || days.length === 0) return [];
  
  const isoDays: number[] = [];
  
  for (const day of days) {
    if (typeof day === 'number') {
      // Handle 0-based arrays (0=Sun, 1=Mon, ..., 6=Sat) -> convert to ISO
      if (day >= 0 && day <= 6) {
        const isoDay = day === 0 ? 7 : day; // 0 (Sun) -> 7, 1-6 stay the same
        isoDays.push(isoDay);
      }
      // Handle 1-based arrays (1=Mon, ..., 7=Sun) -> keep as is
      else if (day >= 1 && day <= 7) {
        isoDays.push(day);
      }
    } else if (typeof day === 'string') {
      const normalized = day.trim().toLowerCase();
      const dayMap: Record<string, number> = {
        'mon': 1, 'monday': 1,
        'tue': 2, 'tues': 2, 'tuesday': 2,
        'wed': 3, 'weds': 3, 'wednesday': 3,
        'thu': 4, 'thur': 4, 'thurs': 4, 'thursday': 4,
        'fri': 5, 'friday': 5,
        'sat': 6, 'saturday': 6,
        'sun': 7, 'sunday': 7,
      };
      
      if (normalized in dayMap) {
        isoDays.push(dayMap[normalized]);
      }
    }
  }
  
  // Remove duplicates and sort
  return Array.from(new Set(isoDays)).sort((a, b) => a - b);
}

/**
 * Formats ISO weekday numbers as human-readable labels
 */
export function formatIsoWeekdays(isoDays: number[]): string {
  if (!isoDays || isoDays.length === 0) return 'Every day';
  
  const labels = isoDays
    .map(day => ISO_WEEKDAY_LABELS[day as keyof typeof ISO_WEEKDAY_LABELS])
    .filter(Boolean);
    
  return labels.join(', ');
}

/**
 * Converts ISO weekday numbers back to 0-based array for backward compatibility
 * Used when saving to database that expects 0-based format
 */
export function isoToZeroBased(isoDays: number[]): number[] {
  return isoDays.map(day => day === 7 ? 0 : day).sort((a, b) => a - b);
}

/**
 * Gets today's ISO weekday number (1=Mon, 7=Sun)
 */
export function getTodayIsoWeekday(): number {
  const today = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  return today === 0 ? 7 : today; // Convert to ISO format
}

// src/lib/date.ts

/**
 * Get current weekday in Pacific/Auckland timezone as lowercase string.
 * Matches the day_of_week column format in the database.
 * 
 * @returns "monday" | "tuesday" | ... | "sunday"
 */
export function getNZSlug(): string {
  return new Date()
    .toLocaleString('en-NZ', { 
      timeZone: 'Pacific/Auckland', 
      weekday: 'long' 
    })
    .toLowerCase();
}


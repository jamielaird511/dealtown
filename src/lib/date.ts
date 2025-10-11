// src/lib/date.ts
export function todaySlug(tz = 'Pacific/Auckland') {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: tz })
    .format(new Date())
    .toLowerCase(); // "monday".."sunday"
}


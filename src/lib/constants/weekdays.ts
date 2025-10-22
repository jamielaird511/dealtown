// ISO 8601 weekday constants (1=Monday, 7=Sunday)
export const ISO_WEEKDAYS = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
} as const;

// Human-readable labels for ISO weekdays
export const ISO_WEEKDAY_LABELS = {
  [ISO_WEEKDAYS.MONDAY]: 'Mon',
  [ISO_WEEKDAYS.TUESDAY]: 'Tue',
  [ISO_WEEKDAYS.WEDNESDAY]: 'Wed',
  [ISO_WEEKDAYS.THURSDAY]: 'Thu',
  [ISO_WEEKDAYS.FRIDAY]: 'Fri',
  [ISO_WEEKDAYS.SATURDAY]: 'Sat',
  [ISO_WEEKDAYS.SUNDAY]: 'Sun',
} as const;

// Array of ISO weekday numbers (1-7)
export const ISO_WEEKDAY_NUMBERS = [1, 2, 3, 4, 5, 6, 7] as const;

// Array of ISO weekday labels
export const ISO_WEEKDAY_LABELS_ARRAY = [
  'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
] as const;

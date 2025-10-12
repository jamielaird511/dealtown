export function getDowInZone(tz = "Pacific/Auckland") {
  // Compute getDay() in a specific IANA timezone
  const now = new Date();
  const zoned = new Date(now.toLocaleString("en-US", { timeZone: tz }));
  return zoned.getDay(); // 0..6 (Sun..Sat)
}

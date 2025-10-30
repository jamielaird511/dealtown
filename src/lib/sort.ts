export type SortDir = "asc" | "desc";

export function compareValues(a: unknown, b: unknown): number {
  // Normalize
  const na = a === undefined || a === null;
  const nb = b === undefined || b === null;
  if (na && nb) return 0;
  if (na) return 1;   // nulls/undefineds sort last
  if (nb) return -1;

  // Numbers (or numeric strings)
  const an = typeof a === "string" && a.trim() !== "" ? Number(a) : a;
  const bn = typeof b === "string" && b.trim() !== "" ? Number(b) : b;
  const isNum = (v: any) => typeof v === "number" && !Number.isNaN(v);
  if (isNum(an) && isNum(bn)) return (an as number) - (bn as number);

  // Dates
  const ad = new Date(String(a));
  const bd = new Date(String(b));
  if (!Number.isNaN(ad.valueOf()) && !Number.isNaN(bd.valueOf())) {
    return ad.getTime() - bd.getTime();
  }

  // Fallback to case-insensitive string compare
  const as = String(a).toLocaleLowerCase();
  const bs = String(b).toLocaleLowerCase();
  if (as < bs) return -1;
  if (as > bs) return 1;
  return 0;
}

export function sortBy<T>(
  arr: T[],
  getter: (item: T) => unknown,
  dir: SortDir = "asc",
): T[] {
  const mult = dir === "asc" ? 1 : -1;
  return [...arr].sort((a, b) => compareValues(getter(a), getter(b)) * mult);
}

export const moneyFromCents = (v?: number | null) =>
  typeof v === "number" ? (v / 100).toFixed(2) : "";

export const centsFromMoney = (s?: string) => {
  if (!s) return null;
  const n = Number(s.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : null;
};

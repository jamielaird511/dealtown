'use client';

import Link from "next/link";
import ActivePill from '@/components/admin/ActivePill';
import { deleteHappyHour } from './actions';

const MON_FIRST = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const SUN_FIRST = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const ONE_BASED = ["","Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function toLabel(v: any): string {
  if (typeof v === "number") return MON_FIRST[v] ?? SUN_FIRST[v] ?? ONE_BASED[v] ?? "?";
  if (typeof v === "string") return v[0].toUpperCase() + v.slice(1).toLowerCase();
  return "?";
}
function fmtDays(v: unknown): string {
  const days = Array.isArray(v) ? v : [];
  return days.map(toLabel).join(", ");
}
function fmtTime(t?: string | null) {
  if (!t) return "—";
  // t is "HH:MM:SS" or "HH:MM"
  const [H, M] = t.split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(H) || Number.isNaN(M)) return "—";
  const h12 = ((H + 11) % 12) + 1;            // 0->12, 13->1, etc
  const ampm = H < 12 ? "am" : "pm";          // ALWAYS lower-case
  const hh = String(h12).padStart(2, "0");
  const mm = String(M).padStart(2, "0");
  return `${hh}:${mm} ${ampm}`;
}
function moneyFromCents(c?: number | null) {
  if (!c && c !== 0) return "—";
  return `$${(c / 100).toFixed(2)}`;
}

type HH = {
  id: string;
  active: boolean;
  venue: string;
  address: string;
  days: string[];
  start: string | null;
  end: string | null;
  price_cents: number | null;
  details: string | null;
};

export default function HappyHourRow({ hh }: { hh: HH }) {
  return (
    <tr className="border-t">
      <td className="px-4 py-3">
        <ActivePill active={hh.active} />
      </td>

      <td className="px-4 py-3">
        <div className="font-medium">{hh.venue}</div>
        {hh.address ? <div className="text-xs text-gray-500">{hh.address}</div> : null}
      </td>

      <td className="px-4 py-3">{fmtDays(hh.days)}</td>

      <td className="px-4 py-3">
        {fmtTime(hh.start)} — {fmtTime(hh.end)}
      </td>

      <td className="px-4 py-3">{moneyFromCents(hh.price_cents)}</td>

      <td className="px-4 py-3">{hh.details || "—"}</td>

      <td className="px-4 py-3">
        <Link href={`/admin/happy-hours/${hh.id}`} className="text-blue-600 hover:underline mr-3">
          Edit
        </Link>
        <form action={deleteHappyHour}>
          <input type="hidden" name="id" value={hh.id} />
          <button
            type="submit"
            className="text-red-600 hover:underline"
            aria-label="Delete happy hour"
          >
            Delete
          </button>
        </form>
      </td>
    </tr>
  );
}
'use client';

import Link from "next/link";
import ActivePill from '@/components/admin/ActivePill';
import { deleteHappyHour } from './actions';

import { DAY_LABELS } from '@/constants/dayLabels';

// add this tiny helper at the top (or import from a utils file)
function toNumberArray(arr: unknown): number[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((x) =>
      typeof x === 'number'
        ? x
        : typeof x === 'string'
          ? parseInt(x, 10)
          : NaN
    )
    .filter((n) => Number.isFinite(n)) as number[];
}

function formatDays(days?: number[]) {
  if (!days || !days.length) return 'Every day';
  const uniq = [...new Set(days)].sort((a, b) => a - b);
  return uniq.map((d) => DAY_LABELS[d]).join(', ');
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
  days: unknown; // can be string[], number[], or mixed
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

      <td className="px-4 py-3">
        {formatDays(toNumberArray(hh.days))}
      </td>

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
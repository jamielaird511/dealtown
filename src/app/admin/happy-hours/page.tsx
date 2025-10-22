import AdminHeader from "@/components/admin/AdminHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import Link from "next/link";
import { getSupabaseServerComponentClient } from "@/lib/supabaseClients";
import { toggleHappyHourActive } from "./actions";
import HappyHourRow from "./HappyHourRow";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function toMsg(err: any, fallback = "Unknown error") {
  try {
    if (!err) return fallback;
    if (typeof err === "string") return err;
    if (err.message) return err.message;
    return JSON.stringify(err);
  } catch {
    return fallback;
  }
}

import { DAY_LABELS } from '@/constants/dayLabels';

function formatDays(days?: number[]) {
  if (!days || !days.length) return 'Every day';
  const uniq = [...new Set(days)].sort((a, b) => a - b);
  return uniq.map((d) => DAY_LABELS[d]).join(', ');
}

async function getHappyHoursSafe(): Promise<{ rows: any[]; errorMsg?: string }> {
  noStore(); // ensure no caching happens for this call
  const supabase = getSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("happy_hours")
    .select(`
      id, title, details, price_cents, start_time, end_time, days, is_active,
      venues:venues!happy_hours_venue_id_fkey ( id, name, address )
    `)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("getHappyHours error:", {
      code: (error as any).code,
      message: (error as any).message,
      details: (error as any).details,
      hint: (error as any).hint,
    });
    return { rows: [], errorMsg: toMsg(error, "Failed to load happy hours") };
  }

  const rows =
    (data ?? []).map((h: any) => ({
      id: h.id,
      venue: h.venues?.name ?? "—",
      address: h.venues?.address ?? "",
      title: h.title,
      details: h.details,
      price_cents: h.price_cents,
      start: h.start_time,
      end: h.end_time,
      days: h.days, // keep raw
      active: !!h.is_active,
    })) ?? [];

  return { rows };
}

export default async function HappyHoursPage({
  searchParams,
}: {
  searchParams?: { error?: string; notice?: string };
}) {
  const { rows, errorMsg } = await getHappyHoursSafe();

  const rawError =
    (searchParams?.error ? decodeURIComponent(searchParams.error) : undefined) ??
    errorMsg;

  const rawNotice = searchParams?.notice ? decodeURIComponent(searchParams.notice) : undefined;

  const errorBanner = rawError === 'NEXT_REDIRECT' ? undefined : rawError;
  const noticeBanner = rawNotice === 'NEXT_REDIRECT' ? undefined : rawNotice;

  return (
    <section className="space-y-4">
      <AdminHeader
        title="Happy Hour"
        subtitle="Times & days for drink specials"
        ctaHref="/admin/happy-hours/new"
        ctaLabel="New Happy Hour"
      />

      {errorBanner && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <div className="flex items-start gap-2">
            <span className="text-red-600" aria-hidden="true">⚠️</span>
            <div>
              <strong>Error:</strong> {errorBanner}
              <div className="mt-1 text-xs text-red-600">
                If this error persists, please check your database permissions and try again.
              </div>
            </div>
          </div>
        </div>
      )}

      {noticeBanner && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <div className="flex items-start gap-2">
            <span className="text-green-600" aria-hidden="true">✅</span>
            <div>
              <strong>Success:</strong> {noticeBanner}
            </div>
          </div>
        </div>
      )}

      <AdminTable
        head={
          <tr>
            <th className="px-4 py-3 font-medium">Active</th>
            <th className="px-4 py-3 font-medium">Venue</th>
            <th className="px-4 py-3 font-medium">Days</th>
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Details</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        }
      >
        {rows.length === 0 ? (
          <tr>
            <td className="px-4 py-6 text-gray-500" colSpan={7}>
              {errorBanner ? "There was a problem loading happy hours." : "No happy hours yet."}
            </td>
          </tr>
        ) : (
          rows.map((h: any) => (
            <HappyHourRow key={h.id} hh={h} />
          ))
        )}
      </AdminTable>
    </section>
  );
}

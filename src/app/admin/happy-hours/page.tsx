"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import HappyHoursTable from "./HappyHoursTable";

const REGIONS = [
  { value: "queenstown", label: "Queenstown" },
  { value: "wanaka", label: "Wanaka" },
  { value: "dunedin", label: "Dunedin" },
];

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

export default function HappyHoursPage() {
  const searchParams = useSearchParams();
  const [region, setRegion] = useState("queenstown");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | undefined>();

  useEffect(() => {
    async function loadHappyHours() {
      setLoading(true);
      setFetchError(undefined);

      const supabase = createClient();
      const { data, error } = await supabase
        .from("happy_hours")
        .select(`
          id, title, details, price_cents, start_time, end_time, days, is_active,
          venues:venues!happy_hours_venue_id_fkey ( id, name, address, region )
        `)
        .order("start_time", { ascending: true });

      if (error) {
        console.error("getHappyHours error:", {
          code: (error as any).code,
          message: (error as any).message,
          details: (error as any).details,
          hint: (error as any).hint,
        });
        setFetchError(toMsg(error, "Failed to load happy hours"));
        setLoading(false);
        return;
      }

      // Filter client-side by venue.region
      const filtered = (data ?? []).filter(
        (h: any) => h.venues?.region === region
      );

      const mappedRows =
        filtered.map((h: any) => ({
          id: h.id,
          venue: h.venues?.name ?? "—",
          address: h.venues?.address ?? "",
          region: h.venues?.region ?? null,
          title: h.title,
          details: h.details,
          price_cents: h.price_cents,
          start: h.start_time,
          end: h.end_time,
          days: h.days, // keep raw
          active: !!h.is_active,
        })) ?? [];

      setRows(mappedRows);
      setLoading(false);
    }

    loadHappyHours();
  }, [region]);

  const rawError =
    (searchParams?.get("error") ? decodeURIComponent(searchParams.get("error")!) : undefined) ??
    fetchError;

  const rawNotice = searchParams?.get("notice") ? decodeURIComponent(searchParams.get("notice")!) : undefined;

  const errorBanner = rawError === 'NEXT_REDIRECT' ? undefined : rawError;
  const noticeBanner = rawNotice === 'NEXT_REDIRECT' ? undefined : rawNotice;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Happy Hour</h1>
          <p className="text-sm text-gray-600">Times & days for drink specials</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <Link
            href="/admin/happy-hours/new"
            className="rounded-lg bg-orange-500 text-white px-4 py-2 font-medium hover:bg-orange-600"
          >
            New Happy Hour
          </Link>
        </div>
      </div>

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

      {loading && (
        <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
          Loading happy hours...
        </div>
      )}

      {!loading && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <HappyHoursTable rows={rows} />
        </div>
      )}
    </section>
  );
}

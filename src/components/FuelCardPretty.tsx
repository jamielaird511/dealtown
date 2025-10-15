"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PriceRoll from "./ui/PriceRoll";

type FuelType = "91" | "95" | "98" | "diesel";
type CheapestRow = {
  fuel: FuelType;
  venue_id: string;
  venue_name: string;
  price_cents: number;
  observed_at: string; // ISO
};

const ORDER: FuelType[] = ["91", "95", "98", "diesel"];

function timeAgo(iso: string) {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
const isStale = (iso: string) => Date.now() - new Date(iso).getTime() > 48 * 3600 * 1000;

export default function FuelCardPretty() {
  const supabase = createClient();
  const [rows, setRows] = useState<Record<FuelType, CheapestRow | null>>({
    "91": null,
    "95": null,
    "98": null,
    diesel: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_FUEL !== "true") return;
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("cheapest_fuel_by_type")
        .select("fuel, venue_id, venue_name, price_cents, observed_at");

      if (!mounted) return;
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }
      const map: any = { "91": null, "95": null, "98": null, diesel: null };
      for (const r of (data ?? []) as CheapestRow[]) map[r.fuel] = r;
      setRows(map);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Cheapest Fuel</h2>
      </div>

      <div className="grid gap-2">
        {ORDER.map((fuel) => {
          const r = rows[fuel];
          return (
            <div
              key={fuel}
              className="flex items-center justify-between rounded-xl border p-3"
            >
              <div className="flex items-center gap-3">
                <span className="w-12 text-center text-sm font-bold tracking-wide">
                  {fuel.toUpperCase()}
                </span>

                {loading ? (
                  <span className="h-7 w-28 animate-pulse rounded bg-gray-200" />
                ) : r ? (
                  <PriceRoll cents={r.price_cents} />
                ) : (
                  <span className="italic text-gray-500">No data yet</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                {r && (
                  <>
                    <span className="opacity-80">— {r.venue_name}</span>
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                        r && isStale(r.observed_at)
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {r ? timeAgo(r.observed_at) : "—"}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-xs opacity-60">
        Times update when new prices land. Orange badge = last update &gt; 48h.
      </p>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { moneyFromCents } from "@/lib/money";
import { timeAgo, isOlderThan48h } from "@/lib/time";

type FuelType = "91" | "95" | "98" | "diesel";
type CheapestRow = {
  fuel: FuelType;
  venue_id: string;
  venue_name: string;
  price_cents: number;
  observed_at: string; // ISO
};

const ORDER: FuelType[] = ["91", "95", "98", "diesel"];

export default function FuelCard() {
  const supabase = createClient();
  const [rows, setRows] = useState<Record<FuelType, CheapestRow | null>>({
    "91": null,
    "95": null,
    "98": null,
    diesel: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("cheapest_fuel_by_type")
        .select("fuel, venue_id, venue_name, price_cents, observed_at");

      if (!mounted) return;
      if (error) {
        console.error("FuelCard fetch error", error);
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
      <h2 className="text-lg font-semibold mb-3">Cheapest Fuel</h2>

      {loading ? (
        <ul className="animate-pulse space-y-2">
          {ORDER.map((k) => (
            <li key={k} className="flex justify-between">
              <span className="w-12 h-4 bg-gray-200 rounded" />
              <span className="w-20 h-4 bg-gray-200 rounded" />
              <span className="w-40 h-4 bg-gray-200 rounded" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-1">
          {ORDER.map((fuel) => {
            const r = rows[fuel];
            if (!r) {
              return (
                <li key={fuel} className="flex items-center justify-between text-gray-500">
                  <span className="font-medium">{fuel.toUpperCase()}</span>
                  <span className="italic">No data yet</span>
                </li>
              );
            }
            const stale = isOlderThan48h(r.observed_at);
            return (
              <li
                key={fuel}
                className={`flex flex-wrap items-center justify-between gap-x-2 ${
                  stale ? "text-orange-600" : ""
                }`}
              >
                <span className="font-semibold">{fuel.toUpperCase()}</span>
                <span className="tabular-nums">{moneyFromCents(r.price_cents)}</span>
                <span className="opacity-80">— {r.venue_name}</span>
                <span className="ml-2 opacity-60">{timeAgo(r.observed_at)}</span>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-2 text-xs opacity-60">Orange = last update &gt; 48h ago.</p>
    </div>
  );
}


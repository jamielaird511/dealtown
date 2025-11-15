"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LunchTable from "./LunchTable";

const REGIONS = [
  { value: "queenstown", label: "Queenstown" },
  { value: "wanaka", label: "Wanaka" },
  { value: "dunedin", label: "Dunedin" },
];

export default function AdminLunchPage() {
  const [region, setRegion] = useState("queenstown");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLunchMenus() {
      setLoading(true);

      const supabase = createClient();
      const { data, error } = await supabase
        .from("lunch_menus")
        .select(`
          id, title, description, price, is_active,
          days_of_week, start_time, end_time,
          venues:venues!lunch_menus_venue_id_fkey (
            id, name, address, region
          )
        `)
        .order("is_active", { ascending: false })
        .order("title", { ascending: true });

      if (error) {
        console.error("[admin lunch list] error", error);
        setRows([]);
        setLoading(false);
        return;
      }

      // Filter client-side by venue.region
      const filtered = (data ?? []).filter(
        (m: any) => m.venues?.region === region
      );

      // Map to format expected by LunchTable
      const mappedRows = filtered.map((m: any) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        price_cents: m.price != null ? Math.round(m.price * 100) : null,
        is_active: m.is_active,
        days: m.days_of_week, // Already int[]
        start_time: m.start_time,
        end_time: m.end_time,
        venue_name: m.venues?.name ?? null,
        venue_address: m.venues?.address ?? null,
      }));

      setRows(mappedRows);
      setLoading(false);
    }

    loadLunchMenus();
  }, [region]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lunch Menus</h1>
          <p className="text-sm text-muted-foreground">Times & days for lunch specials</p>
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
            href="/admin/lunch/new"
            className="rounded-full bg-orange-500 text-white px-4 py-2 text-sm hover:opacity-95"
          >
            Add Lunch Menu
          </Link>
        </div>
      </div>

      {loading && (
        <div className="mt-6 rounded-2xl border bg-white p-8 text-center text-gray-500">
          Loading lunch menus...
        </div>
      )}

      {!loading && <LunchTable rows={rows as any} />}
    </div>
  );
}

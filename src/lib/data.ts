// src/lib/data.ts
import { supabase } from "./supabaseClient";
import { todaySlug } from "./date";

export type Deal = {
  id: number;
  title: string;
  venue_name?: string | null;
  venue_address?: string | null;
  notes?: string | null;
  website_url?: string | null;
  price_cents?: number | null;
  day_of_week?: string;
  is_active?: boolean;
};

export type FuelRow = {
  station_id: number;
  name: string | null;
  fuel: string;
  price_cents: number | null;
  observed_at: string | null;
};

// Re-export for convenience
export { moneyFromCents } from "./money";

export async function fetchDeals(dayParam?: string): Promise<Deal[]> {
  // Compute the actual day_of_week to query
  const day = !dayParam || dayParam === 'today'
    ? todaySlug('Pacific/Auckland')
    : dayParam.toLowerCase();

  const { data, error } = await supabase
    .from("deals")
    .select("id,title,venue_name,venue_address,notes,website_url,kind,price_cents,percent_off,amount_off_cents,buy_qty,get_qty,effective_price_cents,label,day_of_week,is_active")
    .eq("is_active", true)
    .eq("day_of_week", day)
    .order("effective_price_cents", { ascending: true, nullsLast: true })
    .order("price_cents", { ascending: true, nullsLast: true });

  if (error) {
    console.error("[deals]", day, error);
    return [];
  }
  return data ?? [];
}

// existing fuel fetcher (already pointing at the compact view)
export async function fetchFuelStations(): Promise<FuelRow[]> {
  const { data, error } = await supabase
    .from("stations_with_latest_prices")
    .select("station_id,name,fuel,price_cents,observed_at")
    .order("name", { ascending: true })
    // diesel -> 91 -> 95 -> 98 ordering
    .order("fuel", { ascending: true }); // (we already applied CASE sort in SQL view)
  if (error) {
    console.error("[fuel] error", error);
    return [];
  }
  return data ?? [];
}

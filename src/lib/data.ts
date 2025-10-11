// src/lib/data.ts
import { supabase } from "./supabaseClient";

export type Deal = {
  id: number;
  title: string;
  venue_name?: string | null;
  venue_address?: string | null;
  notes?: string | null;
  website_url?: string | null;
  price_cents?: number | null;
};

export type FuelRow = {
  station_id: number;
  name: string | null;
  fuel: string;
  price_cents: number | null;
  observed_at: string | null;
};

export function moneyFromCents(cents?: number | null): string {
  if (cents == null) return "";
  return `$${(cents / 100).toFixed(2)}`;
}

export async function fetchDeals(day?: string): Promise<Deal[]> {
  const d = (day ?? "today").toLowerCase();

  if (d === "today") {
    const { data, error } = await supabase
      .from("today_active_deals")    // view
      .select("id,title,venue_name,venue_address,notes,website_url,price_cents")
      .order("price_cents", { ascending: true, nullsLast: true });
    if (error) {
      console.error("[deals:today]", error);
      return [];
    }
    return data ?? [];
  }

  // Weekday path — table
  const { data, error } = await supabase
    .from("deals")
    .select("id,title,venue_name,venue_address,notes,website_url,price_cents,day_of_week,is_active")
    .eq("is_active", true)
    .eq("day_of_week", d)
    .order("price_cents", { ascending: true, nullsLast: true });

  if (error) {
    console.error("[deals:weekday]", d, error);
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

// src/lib/data.ts
import { supabase } from "./supabaseClient";

export type Deal = {
  id: number;
  title: string;
  venue_name?: string | null;
};

export type FuelRow = {
  station_id: number;
  name: string | null;
  fuel: string;
  price_cents: number | null;
  observed_at: string | null;
};

export async function fetchDeals(day?: string): Promise<Deal[]> {
  const d = (day ?? "today").toLowerCase();

  if (d === "today") {
    const { data, error } = await supabase
      .from("today_active_deals")    // view
      .select("id,title")
      .order("id", { ascending: true });
    if (error) {
      console.error("[deals:today]", error);
      return [];
    }
    return data ?? [];
  }

  // Weekday path — table
  const { data, error } = await supabase
    .from("deals")
    .select("id,title,day_of_week,is_active") // ← no venue_name here
    .eq("is_active", true)
    .eq("day_of_week", d)
    .order("id", { ascending: true });

  if (error) {
    console.error("[deals:weekday]", d, error);
    return [];
  }
  return (data ?? []).map(({ id, title }) => ({ id, title }));
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

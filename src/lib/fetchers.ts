"use server";

import { createClient } from "@/lib/supabase/server";
import type { FuelPrice } from "@/lib/types";

export async function fetchFuelPrices(): Promise<FuelPrice[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("fuel_latest_with_meta")
    .select("product, price_cents, observed_at, brand, venue_name, venue_suburb")
    .order("product", { ascending: true });
  
  if (error) {
    console.error("Fuel fetch error:", error);
    return [];
  }
  
  return (data ?? []) as FuelPrice[];
}


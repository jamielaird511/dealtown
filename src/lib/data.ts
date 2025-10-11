// src/lib/data.ts
import { supabase } from "./supabaseClient";
import { getNZSlug } from "./date";

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

// Re-export for convenience
export { moneyFromCents } from "./money";

// --- Venues ---
export type Venue = {
  id: number;
  name: string;
  address: string | null;
  website_url: string | null;
};

export async function fetchVenues(): Promise<Venue[]> {
  console.log('[fetchVenues] querying venues table...');
  
  const { data, error } = await supabase
    .from('venues') // base table, not a view
    .select('id, name, address, website_url')
    .order('name', { ascending: true });
  
  console.log('[fetchVenues] rows =', data?.length ?? 0, 'error =', error);
  
  if (error) {
    console.error('[venues] error', error);
    return [];
  }
  return data ?? [];
}

export async function fetchVenue(venueId: number): Promise<Venue | null> {
  const { data, error } = await supabase
    .from('venues')
    .select('id, name, address, website_url')
    .eq('id', venueId)
    .maybeSingle();
  
  if (error) {
    console.error('[venues] one error', error);
    return null;
  }
  return data ?? null;
}

// --- Deals for a venue (optional day filter) ---
export async function fetchVenueDeals(venueId: number, day?: string): Promise<Deal[]> {
  console.log('[fetchVenueDeals] venueId =', venueId, 'day =', day);
  
  const selectCols = `
    id, title, notes, price_cents, day_of_week, is_active, venue_id,
    venues:venues!deals_venue_id_fkey ( id, name, address, website_url )
  `;

  let q = supabase
    .from('deals')
    .select(selectCols)
    .eq('venue_id', venueId)
    .eq('is_active', true);

  if (day && day !== 'today') q = q.eq('day_of_week', day.toLowerCase());
  if (day === 'today') q = q.eq('day_of_week', getNZSlug());

  const { data, error } = await q
    .order('is_active', { ascending: false })
    .order('price_cents', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  console.log('[fetchVenueDeals] rows =', data?.length ?? 0, 'error =', error);

  if (error) {
    console.error('[venue deals]', venueId, day, error);
    return [];
  }
  
  return (data ?? []).map((d: any) => ({
    id: d.id,
    title: d.title,
    notes: d.notes,
    price_cents: d.price_cents,
    venue_name: d.venues?.name ?? null,       // include for consistency
    venue_address: d.venues?.address ?? null,
    website_url: d.venues?.website_url ?? null,
  }));
}

export async function fetchDeals(day?: string): Promise<Deal[]> {
  // Normalize day param: mon/tue/wed → monday/tuesday/wednesday
  const shortToLong: Record<string, string> = {
    mon: 'monday', tue: 'tuesday', wed: 'wednesday',
    thu: 'thursday', fri: 'friday', sat: 'saturday', sun: 'sunday',
  };

  const raw = (day ?? 'today').toLowerCase();
  const daySlug = raw === 'today' ? getNZSlug() : (shortToLong[raw] ?? raw);

  console.log('[fetchDeals] input day =', day, '→ daySlug =', daySlug);

  // Query deals table with explicit venue relationship
  const selectCols = `
    id, title, notes, price_cents, day_of_week, is_active, venue_id,
    venues:venues!deals_venue_id_fkey ( id, name, address, website_url )
  `;

  const { data, error } = await supabase
    .from('deals')
    .select(selectCols)
    .eq('is_active', true)
    .eq('day_of_week', daySlug)
    .order('price_cents', { ascending: true, nullsFirst: false });

  console.log('[fetchDeals] rows =', data?.length ?? 0, 'error =', error);

  if (error) {
    console.error("[fetchDeals] ERROR:", daySlug, error);
    return [];
  }
  
  // Map nested venue data to flat structure for backward compatibility
  const mapped = (data ?? []).map((d: any) => ({
    id: d.id,
    title: d.title,
    notes: d.notes,
    price_cents: d.price_cents,
    venue_name: d.venues?.name ?? null,
    venue_address: d.venues?.address ?? null,
    website_url: d.venues?.website_url ?? null,
  }));

  console.log('[fetchDeals] mapped =', mapped.length, 'deals with venue names:', mapped.map(m => `${m.title} @ ${m.venue_name}`));
  return mapped;
}

// existing fuel fetcher (already pointing at the compact view)
export async function fetchFuelStations(): Promise<FuelRow[]> {
  console.log('[fetchFuelStations] querying fuel prices...');
  
  const { data, error } = await supabase
    .from("stations_with_latest_prices")
    .select("station_id,name,fuel,price_cents,observed_at")
    .order("name", { ascending: true })
    // diesel -> 91 -> 95 -> 98 ordering
    .order("fuel", { ascending: true }); // (we already applied CASE sort in SQL view)
  
  console.log('[fetchFuelStations] rows =', data?.length ?? 0, 'error =', error);
  
  if (error) {
    console.error("[fuel] error", error);
    return [];
  }
  return data ?? [];
}

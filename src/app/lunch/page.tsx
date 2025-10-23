import { getSupabaseServerComponentClient } from '@/lib/supabaseClients';
import LunchClient from './LunchClient';

export const revalidate = 60;

export default async function LunchPage() {
  const supabase = getSupabaseServerComponentClient();
  
  // Get today's day name for filtering
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const selectedDay = dayNames[new Date().getDay()];

  const { data, error } = await supabase
    .from("deals")
    .select(`
      id, title, description, price, category, venue_id, day, start_time, end_time,
      venue:venues!deals_venue_id_fkey(id, name, address, website_url)
    `)
    .eq("is_active", true)
    .eq("category", "lunch")
    // TEMP: comment this line if you still get zero rows, to confirm data exists.
    .eq("day", selectedDay)
    .order("start_time", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (error) console.error("[lunch fetch] error", error);
  console.log("[lunch count]", data?.length, { selectedDay });

  const items = (data ?? []).map((row: any) => ({
    id: row.id,
    venue_id: row.venue_id, // ✅ Include venue_id for analytics
    title: row.title,
    description: row.description,
    price: row.price != null ? row.price : null,
    days_of_week: null, // Not used in deals table
    start_time: row.start_time,
    end_time: row.end_time,
    venueName: row.venue?.name ?? null,
    addressLine: row.venue?.address ?? null,
    venueWebsite: row.venue?.website_url ?? null,
  }));

  return <LunchClient items={items} />;
}

import { getSupabaseServerComponentClient } from '@/lib/supabaseClients';
import LunchClient from './LunchClient';

export const revalidate = 60;

// Add above your sort or near imports
function getVenueName(venue: unknown): string {
  if (!venue) return "";
  // handle either a single embedded object or an accidental array embed
  if (Array.isArray(venue)) return (venue[0] as any)?.name ?? "";
  return (venue as any)?.name ?? "";
}

export default async function LunchPage() {
  const supabase = getSupabaseServerComponentClient();
  
  const { data, error } = await supabase
    .from('lunch_menus')
    .select(`
      id, title, description, price_cents,
      start_time, end_time, days_of_week, is_active,
      venue_id,
      venue:venues!lunch_menus_venue_id_fkey(id, name, address, city, website_url)
    `)
    .eq('is_active', true);

  if (error) {
    console.error("[lunch] fetch error", error);
  }

  // Day filtering (match your other pages)
  // 0=Sun ... 6=Sat (same convention we used elsewhere)
  const todayIdx = new Date().getDay();
  const showToday = (row: { days_of_week: number[] | null }) =>
    !row.days_of_week || row.days_of_week.length === 0 || row.days_of_week.includes(todayIdx);

  const rows = (data ?? []).filter(showToday);

  // Sorting (consistent with your spec)
  // Primary: start_time (nulls last)
  // Secondary: venue name A–Z
  rows.sort((a: any, b: any) => {
    const at = a.start_time ? a.start_time : "99:99";
    const bt = b.start_time ? b.start_time : "99:99";
    if (at !== bt) return at.localeCompare(bt);

    const aName = getVenueName(a.venue);
    const bName = getVenueName(b.venue);
    return aName.localeCompare(bName);
  });

  const items = rows.map((row: any) => {
    const venue = Array.isArray(row.venue) ? row.venue[0] : row.venue;
    return {
      id: row.id,
      venue_id: row.venue_id, // ✅ Include venue_id for analytics
      title: row.title,
      description: row.description,
      price: row.price_cents != null ? row.price_cents / 100 : null,
      days_of_week: row.days_of_week ?? null,
      start_time: row.start_time,
      end_time: row.end_time,
      venueName: venue?.name ?? null,
      addressLine: venue ? [venue.address, venue.city].filter(Boolean).join(", ") : null,
      venueWebsite: venue?.website_url ?? null,
    };
  });

  return <LunchClient items={items} />;
}

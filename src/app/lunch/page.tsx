import { getSupabaseServerComponentClient } from '@/lib/supabaseClients';
import LunchClient from './LunchClient';

export const revalidate = 60;

export default async function LunchPage() {
  const supabase = getSupabaseServerComponentClient();
  
  const { data, error } = await supabase
    .from('lunch_specials')
    .select(`
      id, title, description, price_cents,
      start_time, end_time, days, is_active,
      venue_name, venue_address
    `)
    .eq('is_active', true);

  if (error) {
    console.error("[lunch] fetch error", error);
  }

  // Day filtering (match your other pages)
  // 0=Sun ... 6=Sat (same convention we used elsewhere)
  const todayIdx = new Date().getDay();
  const showToday = (row: { days: number[] | null }) =>
    !row.days || row.days.length === 0 || row.days.includes(todayIdx);

  const rows = (data ?? []).filter(showToday);

  // Sorting (consistent with your spec)
  // Primary: start_time (nulls last)
  // Secondary: venue name A–Z
  rows.sort((a, b) => {
    const at = a.start_time ? a.start_time : '99:99';
    const bt = b.start_time ? b.start_time : '99:99';
    if (at !== bt) return at.localeCompare(bt);
    return (a.venue_name ?? '').localeCompare(b.venue_name ?? '');
  });

  const items = rows.map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price_cents != null ? row.price_cents / 100 : null,
    days_of_week: row.days ?? null,
    start_time: row.start_time,
    end_time: row.end_time,
    venueName: row.venue_name ?? null,
    addressLine: row.venue_address ?? null,
  }));

  return <LunchClient items={items} />;
}

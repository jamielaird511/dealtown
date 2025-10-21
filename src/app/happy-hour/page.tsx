import { getSupabaseServerComponentClient } from '@/lib/supabaseClients';
import HappyHourClient from './HappyHourClient';

export const revalidate = 60;

export default async function HappyHourPage() {
  const supabase = getSupabaseServerComponentClient();

  const { data, error } = await supabase
    .from("happy_hours")
    .select(`
      id,
      title,
      details,
      price_cents,
      start_time,
      end_time,
      days,
      is_active,
      venue:venues!happy_hours_venue_id_fkey(name, address, suburb)
    `)
    .eq("is_active", true);

  if (error) {
    console.error("[happy hour] fetch error", error);
  }

  // Map strings/numbers -> 0..6 (Sun..Sat)
  const dayMap: Record<string, number> = {
    sun: 0, sunday: 0,
    mon: 1, monday: 1,
    tue: 2, tues: 2, tuesday: 2,
    wed: 3, weds: 3, wednesday: 3,
    thu: 4, thur: 4, thurs: 4, thursday: 4,
    fri: 5, friday: 5,
    sat: 6, saturday: 6,
  };

  const normalizeDays = (arr: unknown): number[] | null => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return null; // null = show every day
    const out: number[] = [];
    for (const v of arr) {
      if (typeof v === "number") out.push(v >= 1 && v <= 7 ? v % 7 : v); // 1..7 -> 0..6
      else if (typeof v === "string") {
        const k = v.trim().toLowerCase();
        if (k in dayMap) out.push(dayMap[k]);
      }
    }
    return out.length ? Array.from(new Set(out)).sort((a, b) => a - b) : null;
  };

  const items = (data ?? []).map((row: any) => ({
    id: row.id,
    notes: row.details ?? null,
    // optional price badge if you want it
    price: row.price_cents != null ? row.price_cents / 100 : null,

    start_time: row.start_time,
    end_time: row.end_time,

    // 👇 normalize happy_hours.days -> client expected days_of_week
    days_of_week: normalizeDays(row.days),

    venueName: row.venue?.name ?? null,
    addressLine: [row.venue?.address, row.venue?.suburb].filter(Boolean).join(", ") || null,
  }));

  return <HappyHourClient items={items} />;
}

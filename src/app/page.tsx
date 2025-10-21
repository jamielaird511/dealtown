import { getSupabaseServerComponentClient } from '@/lib/supabaseClients';
import DealsClient from './deals/DealsClient';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = getSupabaseServerComponentClient();

  const { data, error } = await supabase
    .from("deals")
    .select(`
      id,
      title,
      description,
      price_cents,
      effective_price_cents,
      is_active,
      day_of_week,
      venue_name,
      venue_address,
      venue:venues!deals_venue_id_fkey(name, address, suburb)
    `)
    .eq("is_active", true);

  if (error) {
    console.error("[home deals] fetch error", error);
  }

  // map day names → numbers (0=Sun, 1=Mon, ...)
  const dayMap: Record<string, number> = {
    sun: 0, sunday: 0,
    mon: 1, monday: 1,
    tue: 2, tues: 2, tuesday: 2,
    wed: 3, weds: 3, wednesday: 3,
    thu: 4, thur: 4, thurs: 4, thursday: 4,
    fri: 5, friday: 5,
    sat: 6, saturday: 6,
  };

  const toDaysArray = (d: unknown): number[] | null => {
    if (!d) return null; // null = every day
    if (typeof d === "number") return [d >= 1 && d <= 7 ? d % 7 : d];
    if (typeof d === "string") {
      const key = d.trim().toLowerCase();
      return key in dayMap ? [dayMap[key]] : null;
    }
    return null;
  };

  const items = (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,                   // deal title (e.g., "Taco Tuesday")
    description: row.description,       // notes
    price: (row.effective_price_cents ?? row.price_cents ?? null) / 100 || null,
    days_of_week: toDaysArray(row.day_of_week),

    // 👇 pull from denormalized columns first, then joined venue
    venueName: row.venue_name ?? row.venue?.name ?? null,
    addressLine:
      row.venue_address ??
      ([row.venue?.address, row.venue?.suburb].filter(Boolean).join(", ") ||
      null),
  }));

  return <DealsClient items={items} />;
}

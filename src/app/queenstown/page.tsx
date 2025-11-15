import { getSupabaseServerComponentClient } from "@/lib/supabaseClients";
import DealsClient from "@/app/deals/DealsClient";

export const revalidate = 60;

export default async function QueenstownPage() {
  const supabase = getSupabaseServerComponentClient();

  const { data, error } = await supabase
    .from("deals")
    .select(
      `
      *,
      venue:venues!deals_venue_fk(
        id,
        name,
        address,
        website_url,
        region
      )
    `
    )
    .eq("is_active", true)
    .eq("region", "queenstown");

  if (error) {
    console.error("[queenstown deals] fetch error", error);
  }

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
    if (!d) return null;
    if (typeof d === "number") return [d >= 1 && d <= 7 ? d % 7 : d];
    if (typeof d === "string") {
      const key = d.trim().toLowerCase();
      return key in dayMap ? [dayMap[key]] : null;
    }
    return null;
  };

  const items = (data ?? []).map((row: any) => ({
    id: row.id,
    venue_id: row.venue_id,
    title: row.title,
    description: row.description,
    price: (row.effective_price_cents ?? row.price_cents ?? null) / 100 || null,
    days_of_week: toDaysArray(row.day_of_week),
    venueName: row.venue_name ?? row.venue?.name ?? null,
    addressLine:
      row.venue_address ??
      ([row.venue?.address, row.venue?.suburb].filter(Boolean).join(", ") ||
        null),
    venue: row.venue
      ? {
          id: row.venue_id,
          name: row.venue.name,
          address: row.venue.address,
          website: row.venue.website,
          website_url: row.venue.website_url,
        }
      : null,
  }));

  return <DealsClient items={items} />;
}

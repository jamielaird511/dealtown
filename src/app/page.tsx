import { getSupabaseServerComponentClient } from '@/lib/supabaseClients';
import DealsClient from './deals/DealsClient';
import { collectionJsonLd } from '@/lib/ld';

export const metadata = {
  title: "Find a Deal. Share a Deal. | DealTown Queenstown",
  description: "Browse today's best deals across Queenstown — happy hour, lunch specials, daily offers, and more.",
};

export const revalidate = 60;

export default async function HomePage() {
  const supabase = getSupabaseServerComponentClient();

  const { data, error } = await supabase
    .from("deals")
    .select(`
      *,
      venue:venues!deals_venue_fk(
        id,
        name,
        address,
        website_url
      )
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
    venue_id: row.venue_id, // ✅ Include venue_id for analytics
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
    
    // ✅ Include venue object with website for DealCard
    venue: row.venue ? {
      id: row.venue_id,
      name: row.venue.name,
      address: row.venue.address,
      website: row.venue.website,
      website_url: row.venue.website_url
    } : null,
  }));

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dealtown.nz";
  const jsonLd = collectionJsonLd({
    name: "Daily Deals – DealTown",
    url: base,
    description: "Live list of Queenstown daily deals.",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DealsClient items={items} />
    </>
  );
}

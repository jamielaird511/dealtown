import { getSupabaseServerComponentClient } from '@/lib/supabaseClients';
import LunchClient from './LunchClient';
import { collectionJsonLd } from '@/lib/ld';

export const metadata = {
  title: "Best Lunch Specials in Queenstown | DealTown",
  description: "Find affordable lunch specials and set menus across Queenstown.",
  alternates: {
    canonical: "/lunch",
  },
};

export const revalidate = 60;

export default async function LunchPage() {
  const supabase = getSupabaseServerComponentClient();

  // 1) Pull lunch rows from the dedicated view
  const { data: lunchRows, error: e0 } = await supabase
    .from('lunch_specials')
    .select('*')                     // view already filters to lunch
    .eq('is_active', true)           // keep if the view exposes this
    .order('start_time', { ascending: true, nullsFirst: false })
    .order('id', { ascending: true });

  if (e0) {
    console.error('[lunch] view fetch error', e0);
    return <LunchClient items={[]} />;
  }

  const rows = lunchRows ?? [];
  if (rows.length === 0) {
    return <LunchClient items={[]} />;
  }

  // 2) Fetch venues for the referenced venue_ids
  const venueIds = Array.from(new Set(rows.map((r: any) => r.venue_id).filter(Boolean)));
  let venueMap: Record<number, { id: number; name?: string | null; address?: string | null; website_url?: string | null }> = {};

  if (venueIds.length > 0) {
    const { data: venues, error: e1 } = await supabase
      .from('venues')
      .select('id, name, address, website_url')
      .in('id', venueIds);

    if (e1) {
      console.error('[lunch] venues fetch error', e1);
    } else {
      venueMap = Object.fromEntries((venues ?? []).map(v => [v.id, v]));
    }
  }

  // 3) Map rows → UI items
  const items = rows.map((row: any) => {
    const v = venueMap[row.venue_id] || {};
    return {
      id: row.id,
      venue_id: row.venue_id,
      title: row.title,
      description: row.description,
      price: row?.price ?? null,
      days_of_week: null, // not used here
      start_time: row.start_time,
      end_time: row.end_time,
      venueName: v.name ?? null,
      addressLine: v.address ?? null,
      venueWebsite: v.website_url ?? null,
    };
  });

  // 4) Sort for nice UX (time then venue)
  items.sort((a, b) => {
    const at = a.start_time ?? '99:99';
    const bt = b.start_time ?? '99:99';
    if (at !== bt) return at.localeCompare(bt);
    return (a.venueName ?? '').localeCompare(b.venueName ?? '');
  });

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dealtown.nz";
  const jsonLd = collectionJsonLd({
    name: "Lunch Specials – DealTown",
    url: `${base}/lunch`,
    description: "Live list of Queenstown lunch specials.",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LunchClient items={items} />
    </>
  );
}

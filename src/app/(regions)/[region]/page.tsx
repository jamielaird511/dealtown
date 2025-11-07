import { getSupabaseServerComponentClient } from "@/lib/supabaseClients";
import DealsClient from "@/app/deals/DealsClient";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function RegionPage({ params }: { params: { region: string } }) {
  const region = params.region.toLowerCase();
  const supabase = getSupabaseServerComponentClient();

  const { data: deals, error } = await supabase
    .from("deals")
    .select("*")
    .eq("region", region)
    .eq("is_active", true);

  if (error || !deals || deals.length === 0) {
    return notFound();
  }

  const items = deals.map((deal: any) => ({
    id: deal.id,
    venue_id: deal.venue_id,
    title: deal.title,
    description: deal.description,
    price: deal.effective_price_cents
      ? deal.effective_price_cents / 100
      : deal.price_cents
      ? deal.price_cents / 100
      : null,
    days_of_week: null,
    venueName: deal.venue_name ?? deal.venue?.name ?? null,
    addressLine: deal.venue_address ?? deal.venue?.address ?? null,
    venue: deal.venue ?? null,
  }));

  return <DealsClient items={items} />;
}

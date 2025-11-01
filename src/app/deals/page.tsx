import { getSupabaseServerComponentClient } from '@/lib/supabaseClients';
import DealsClient from './DealsClient';

export const metadata = {
  title: "Queenstown Daily Deals | DealTown",
  description: "Today's best Queenstown deals from local venues — updated frequently.",
};

export const revalidate = 60;

export default async function DealsPage() {
  const supabase = getSupabaseServerComponentClient();
  // adjust select to your schema; include venue fields + price if any
  const { data } = await supabase
    .from('deals')
    .select(`
      id, title, description, price, days_of_week,
      venue:venues ( name, address, suburb )
    `)
    .eq('is_active', true);

  const items = (data ?? []).map((d: any) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    price: d.price,
    days_of_week: d.days_of_week ?? null,
    venueName: d.venue?.name ?? null,
    addressLine: [d.venue?.address, d.venue?.suburb].filter(Boolean).join(', ') || null,
  }));

  return <DealsClient items={items} />;
}



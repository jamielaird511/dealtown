import { getSupabaseServerComponentClient } from '@/lib/supabaseClients';
import LunchClient from './LunchClient';

export const revalidate = 60;

export default async function LunchPage() {
  const supabase = getSupabaseServerComponentClient();
  const { data } = await supabase
    .from('lunch_menus')
    .select(`
      id, title, description, price, days_of_week, start_time, end_time,
      venue:venues ( name, address, suburb )
    `)
    .eq('is_active', true);

  const items = (data ?? []).map((d: any) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    price: d.price,
    days_of_week: d.days_of_week ?? null,
    start_time: d.start_time,
    end_time: d.end_time,
    venueName: d.venue?.name ?? null,
    addressLine: [d.venue?.address, d.venue?.suburb].filter(Boolean).join(', ') || null,
  }));

  return <LunchClient items={items} />;
}

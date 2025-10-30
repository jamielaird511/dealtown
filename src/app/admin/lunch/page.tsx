import Link from 'next/link';
import { getSupabaseServerComponentClient } from '@/lib/supabaseClients';
import LunchTable from './LunchTable';


export default async function AdminLunchPage() {
  const supabase = getSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from('lunch_specials')
    .select(`
      id, title, description, price_cents, is_active,
      days, start_time, end_time,
      venue_name, venue_address
    `)
    .order('is_active', { ascending: false })
    .order('title', { ascending: true });

  if (error) {
    console.error('[admin lunch list] error', error);
  }

  const rows = data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lunch Menus</h1>
          <p className="text-sm text-muted-foreground">Times & days for lunch specials</p>
        </div>
        <Link
          href="/admin/lunch/new"
          className="rounded-full bg-orange-500 text-white px-4 py-2 text-sm hover:opacity-95"
        >
          Add Lunch Menu
        </Link>
      </div>

      <LunchTable rows={rows as any} />
    </div>
  );
}

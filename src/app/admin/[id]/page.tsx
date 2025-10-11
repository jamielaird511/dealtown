import { requireAdmin } from '@/lib/auth';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditDealPage({ 
  params,
  searchParams 
}: { 
  params: { id: string };
  searchParams?: { error?: string };
}) {
  const { supabase } = await requireAdmin();
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const { data: deal } = await supabase
    .from('deals')
    .select(`
      id, title, day_of_week, is_active, venue_id, price_cents, notes,
      venue:venues!deals_venue_id_fkey ( id, name, address, website_url )
    `)
    .eq('id', id)
    .maybeSingle();

  const { data: venues } = await supabase
    .from('venues')
    .select('id,name,address')
    .order('name', { ascending: true });

  if (!deal) notFound();

  const error = searchParams?.error;

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Deal</h1>
        <Link href="/admin" className="text-sm text-gray-600 hover:underline">
          Back
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <form action={`/api/admin/deals/${deal.id}`} method="post" className="space-y-4">
        <input type="hidden" name="_method" value="PATCH" />

        <div>
          <label className="block text-sm font-medium mb-1">Venue *</label>
          <select name="venue_id" required defaultValue={deal.venue_id ?? ''} className="w-full rounded border px-3 py-2">
            <option value="">Select a venue…</option>
            {(venues ?? []).map(v => (
              <option key={v.id} value={v.id}>
                {v.name}{v.address ? ` — ${v.address}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input name="title" defaultValue={deal.title} required className="w-full rounded border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Day of week *</label>
          <select name="day_of_week" required defaultValue={deal.day_of_week} className="w-full rounded border px-3 py-2">
            {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="is_active" defaultChecked={deal.is_active} id="is_active" />
          <label htmlFor="is_active" className="text-sm">Active</label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price (dollars)</label>
          <input 
            name="price" 
            type="number"
            inputMode="decimal"
            min="0" 
            step="0.01" 
            defaultValue={deal.price_cents != null ? (deal.price_cents / 100).toFixed(2) : ''} 
            className="w-full rounded border px-3 py-2" 
            placeholder="e.g. 28.00" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea 
            name="notes" 
            rows={3} 
            defaultValue={deal.notes ?? ''} 
            className="w-full rounded border px-3 py-2" 
            placeholder="Optional details about the deal..." 
          />
        </div>

        <button type="submit" className="rounded bg-orange-500 text-white px-4 py-2 font-medium hover:bg-orange-600">
          Save Changes
        </button>
      </form>
    </main>
  );
}

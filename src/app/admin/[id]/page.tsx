// src/app/admin/[id]/page.tsx
import { redirect, notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EditDealPage({ params }: { params: { id: string } }) {
  const { supabase } = await requireAdmin();

  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const { data: deal, error } = await supabase
    .from('deals')
    .select('id,title,day_of_week,is_active,venue_name,venue_address,website_url,notes,price_cents')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!deal) notFound();

  // very small form; posts to our PATCH API
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Edit deal</h1>
        <Link href="/admin" className="text-sm text-gray-600 hover:underline">Back</Link>
      </div>

      <form
        action={`/api/admin/deals/${deal.id}`}
        method="post"
        className="space-y-4"
      >
        <input type="hidden" name="_method" value="PATCH" />
        <label className="block">
          <span className="text-sm">Title</span>
          <input name="title" defaultValue={deal.title} required className="mt-1 w-full rounded border px-3 py-2" />
        </label>

        <label className="block">
          <span className="text-sm">Day of week</span>
          <select name="day_of_week" defaultValue={deal.day_of_week} className="mt-1 w-full rounded border px-3 py-2">
            {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm">Venue name</span>
            <input name="venue_name" defaultValue={deal.venue_name} className="mt-1 w-full rounded border px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm">Venue address</span>
            <input name="venue_address" defaultValue={deal.venue_address} className="mt-1 w-full rounded border px-3 py-2" />
          </label>
        </div>

        <label className="block">
          <span className="text-sm">Website URL</span>
          <input name="website_url" defaultValue={deal.website_url ?? ''} className="mt-1 w-full rounded border px-3 py-2" />
        </label>

        <label className="block">
          <span className="text-sm">Notes</span>
          <textarea name="notes" defaultValue={deal.notes ?? ''} className="mt-1 w-full rounded border px-3 py-2" />
        </label>

        <label className="block">
          <span className="text-sm">Price (e.g. 12.50)</span>
          <input name="price" defaultValue={deal.price_cents ? (deal.price_cents / 100).toFixed(2) : ''} className="mt-1 w-full rounded border px-3 py-2" />
        </label>

        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="is_active" defaultChecked={deal.is_active} />
          <span>Active</span>
        </label>

        <div className="pt-2">
          <button className="rounded bg-orange-600 text-white px-4 py-2">Save changes</button>
        </div>
      </form>
    </div>
  );
}


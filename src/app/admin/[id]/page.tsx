// src/app/admin/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// This must be a client component to handle kind switching
export default function EditDealPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<'fixed' | 'percent_off' | 'amount_off' | 'bogo'>('fixed');

  useEffect(() => {
    async function loadDeal() {
      const res = await fetch(`/api/admin/deals?id=${params.id}`);
      if (res.ok) {
        const json = await res.json();
        const d = json.data?.[0];
        if (d) {
          setDeal(d);
          setKind(d.kind || 'fixed');
        }
      }
      setLoading(false);
    }
    loadDeal();
  }, [params.id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!deal) return <div className="p-6">Deal not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Edit Deal</h1>
        <Link href="/admin" className="text-sm text-gray-600 hover:underline">Back</Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
          {error}
        </div>
      )}

      <form action={`/api/admin/deals/${deal.id}`} method="post" className="space-y-4">
        <input type="hidden" name="_method" value="PATCH" />
        
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input name="title" defaultValue={deal.title} required className="w-full rounded border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm mb-1">Day of week</label>
          <select name="day_of_week" defaultValue={deal.day_of_week} className="w-full rounded border px-3 py-2">
            {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => (
              <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Deal Type</label>
          <select 
            name="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as any)}
            className="w-full rounded border px-3 py-2"
          >
            <option value="fixed">Fixed Price</option>
            <option value="percent_off">Percent Off</option>
            <option value="amount_off">Amount Off</option>
            <option value="bogo">BOGO / Multi-buy</option>
          </select>
        </div>

        {/* Conditional fields */}
        {kind === 'fixed' && (
          <div>
            <label className="block text-sm mb-1">Price</label>
            <input
              name="price"
              type="text"
              defaultValue={deal.price_cents ? (deal.price_cents / 100).toFixed(2) : ''}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
        )}

        {kind === 'percent_off' && (
          <>
            <div>
              <label className="block text-sm mb-1">Percent Off</label>
              <input
                name="percent_off"
                type="number"
                min="1"
                max="100"
                defaultValue={deal.percent_off ?? ''}
                required
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Original Price (optional)</label>
              <input
                name="price"
                type="text"
                defaultValue={deal.price_cents ? (deal.price_cents / 100).toFixed(2) : ''}
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </>
        )}

        {kind === 'amount_off' && (
          <>
            <div>
              <label className="block text-sm mb-1">Amount Off</label>
              <input
                name="amount_off"
                type="text"
                defaultValue={deal.amount_off_cents ? (deal.amount_off_cents / 100).toFixed(2) : ''}
                required
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Original Price (optional)</label>
              <input
                name="price"
                type="text"
                defaultValue={deal.price_cents ? (deal.price_cents / 100).toFixed(2) : ''}
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </>
        )}

        {kind === 'bogo' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Buy Qty</label>
                <input
                  name="buy_qty"
                  type="number"
                  min="1"
                  defaultValue={deal.buy_qty ?? 1}
                  required
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Get Qty</label>
                <input
                  name="get_qty"
                  type="number"
                  min="1"
                  defaultValue={deal.get_qty ?? 1}
                  required
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Item Price (optional)</label>
              <input
                name="price"
                type="text"
                defaultValue={deal.price_cents ? (deal.price_cents / 100).toFixed(2) : ''}
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Venue name</label>
            <input name="venue_name" defaultValue={deal.venue_name} required className="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Venue address</label>
            <input name="venue_address" defaultValue={deal.venue_address} required className="w-full rounded border px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Website URL (optional)</label>
          <input
            name="website_url"
            type="url"
            defaultValue={deal.website_url ?? ''}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Notes (optional)</label>
          <textarea
            name="notes"
            defaultValue={deal.notes ?? ''}
            rows={3}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="is_active" defaultChecked={deal.is_active} />
          <span>Active</span>
        </label>

        <div className="pt-2 flex gap-3">
          <button type="submit" className="rounded bg-orange-600 text-white px-4 py-2">
            Save changes
          </button>
          <Link href="/admin" className="rounded border px-4 py-2 text-gray-700 inline-flex items-center">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

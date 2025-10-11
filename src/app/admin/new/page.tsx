'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function NewDealPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [kind, setKind] = useState<'fixed' | 'percent_off' | 'amount_off' | 'bogo'>('fixed');

  return (
    <main className="p-6 max-w-xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Deal</h1>
        <Link href="/admin" className="text-sm text-gray-600 hover:underline">Back</Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
          {error}
        </div>
      )}

      <form action="/api/admin/deals" method="post" className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input
            name="title"
            required
            placeholder="e.g., 2-for-1 Pizza Night"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Day of week</label>
          <select name="day_of_week" required className="w-full rounded-xl border px-4 py-3">
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
            className="w-full rounded-xl border px-4 py-3"
          >
            <option value="fixed">Fixed Price</option>
            <option value="percent_off">Percent Off</option>
            <option value="amount_off">Amount Off</option>
            <option value="bogo">BOGO / Multi-buy</option>
          </select>
        </div>

        {/* Conditional fields based on kind */}
        {kind === 'fixed' && (
          <div>
            <label className="block text-sm mb-1">Price</label>
            <input
              name="price"
              type="text"
              required
              placeholder="12.50"
              className="w-full rounded-xl border px-4 py-3"
            />
            <p className="text-xs text-gray-500 mt-1">Enter as dollars</p>
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
                required
                placeholder="50"
                className="w-full rounded-xl border px-4 py-3"
              />
              <p className="text-xs text-gray-500 mt-1">1-100%</p>
            </div>
            <div>
              <label className="block text-sm mb-1">Original Price (optional)</label>
              <input
                name="price"
                type="text"
                placeholder="20.00"
                className="w-full rounded-xl border px-4 py-3"
              />
              <p className="text-xs text-gray-500 mt-1">For calculating effective price</p>
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
                required
                placeholder="5.00"
                className="w-full rounded-xl border px-4 py-3"
              />
              <p className="text-xs text-gray-500 mt-1">Discount in dollars</p>
            </div>
            <div>
              <label className="block text-sm mb-1">Original Price (optional)</label>
              <input
                name="price"
                type="text"
                placeholder="20.00"
                className="w-full rounded-xl border px-4 py-3"
              />
              <p className="text-xs text-gray-500 mt-1">For calculating effective price</p>
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
                  defaultValue="1"
                  required
                  className="w-full rounded-xl border px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Get Qty</label>
                <input
                  name="get_qty"
                  type="number"
                  min="1"
                  defaultValue="1"
                  required
                  className="w-full rounded-xl border px-4 py-3"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Item Price (optional)</label>
              <input
                name="price"
                type="text"
                placeholder="10.00"
                className="w-full rounded-xl border px-4 py-3"
              />
              <p className="text-xs text-gray-500 mt-1">For calculating effective unit price</p>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm mb-1">Venue name</label>
          <input
            name="venue_name"
            required
            placeholder="e.g., Pizza Palace"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Venue address</label>
          <input
            name="venue_address"
            required
            placeholder="e.g., 123 Main St, Queenstown"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Website URL (optional)</label>
          <input
            name="website_url"
            type="url"
            placeholder="https://example.com"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Notes (optional)</label>
          <textarea
            name="notes"
            placeholder="Additional details..."
            rows={3}
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_active" defaultChecked />
          <span className="text-sm">Active (visible on homepage)</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-xl bg-orange-500 px-4 py-3 text-white font-medium"
          >
            Create Deal
          </button>
          <Link href="/admin" className="rounded-xl border px-4 py-3 text-gray-700 inline-flex items-center">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}

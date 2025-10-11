'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function NewDealPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <main className="p-6 max-w-xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Deal</h1>
        <Link href="/admin" className="text-sm text-gray-600 hover:underline">Back</Link>
      </div>

      {/* Error Message */}
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

        <div>
          <label className="block text-sm mb-1">Price</label>
          <input
            name="price"
            type="text"
            placeholder="12.50"
            className="w-full rounded-xl border px-4 py-3"
          />
          <p className="text-xs text-gray-500 mt-1">Enter as dollars (e.g., &quot;12&quot; or &quot;12.50&quot;). Leave blank for free/TBD.</p>
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

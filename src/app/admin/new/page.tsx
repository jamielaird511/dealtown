import { requireAdmin } from "@/lib/auth";
import Link from "next/link";

export default async function NewDealPage({ searchParams }: { searchParams?: { error?: string } }) {
  const { supabase } = await requireAdmin();

  const { data: venues } = await supabase
    .from("venues")
    .select("id,name,address")
    .order("name", { ascending: true });

  const error = searchParams?.error;

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Deal</h1>
        <Link href="/admin" className="text-sm text-gray-600 hover:underline">
          Back
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <form action="/api/admin/deals" method="post" className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Region *</label>
          <select name="region" required className="w-full rounded border px-3 py-2">
            <option value="">Select a region…</option>
            <option value="queenstown">Queenstown</option>
            <option value="wanaka">Wanaka</option>
            <option value="dunedin">Dunedin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Venue *</label>
          <select name="venue_id" required className="w-full rounded border px-3 py-2">
            <option value="">Select a venue…</option>
            {(venues ?? []).map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <div className="text-xs mt-1 text-gray-600">
            Need a new venue?{" "}
            <Link href="/admin/venues/new" className="text-blue-600 underline">
              Add one
            </Link>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input name="title" required className="w-full rounded border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Day of week *</label>
          <select name="day_of_week" required className="w-full rounded border px-3 py-2">
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(
              (d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              )
            )}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="is_active" defaultChecked id="is_active" />
          <label htmlFor="is_active" className="text-sm">
            Active
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price (dollars)</label>
          <input
            name="price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            className="w-full rounded border px-3 py-2"
            placeholder="e.g. 28.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            rows={3}
            className="w-full rounded border px-3 py-2"
            placeholder="Internal notes (not shown publicly)"
          />
        </div>

        <button
          type="submit"
          className="rounded bg-orange-500 text-white px-4 py-2 font-medium hover:bg-orange-600"
        >
          Save Deal
        </button>
      </form>
    </main>
  );
}

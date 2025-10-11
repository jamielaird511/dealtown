'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import Link from 'next/link';

const dayEnum = z.enum(['monday','tuesday','wednesday','thursday','friday','saturday','sunday']);

const formSchema = z.object({
  title: z.string().min(2, 'Title required'),
  day_of_week: dayEnum,
  venue_name: z.string().min(2, 'Venue name required'),
  venue_address: z.string().min(2, 'Address required'),
  website_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
  price: z.string().optional(),
  is_active: z.boolean().default(true),
});

export default function NewDealPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      day_of_week: formData.get('day_of_week') as string,
      venue_name: formData.get('venue_name') as string,
      venue_address: formData.get('venue_address') as string,
      website_url: formData.get('website_url') as string,
      notes: formData.get('notes') as string,
      price: formData.get('price') as string,
      is_active: formData.get('is_active') === 'on',
    };

    const parsed = formSchema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach(e => { errs[e.path[0]] = e.message; });
      setErrors(errs);
      setSubmitting(false);
      return;
    }

    const res = await fetch('/api/admin/deals', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });

    setSubmitting(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      alert(json.message || 'Failed to create deal');
      return;
    }

    router.push('/admin');
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">New Deal</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            name="title"
            required
            placeholder="Title"
            className="w-full rounded-xl border px-4 py-3"
          />
          {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
        </div>

        <div>
          <select name="day_of_week" required className="w-full rounded-xl border px-4 py-3">
            {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => (
              <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
            ))}
          </select>
          {errors.day_of_week && <p className="text-sm text-red-600 mt-1">{errors.day_of_week}</p>}
        </div>

        <div>
          <input
            name="venue_name"
            required
            placeholder="Venue name"
            className="w-full rounded-xl border px-4 py-3"
          />
          {errors.venue_name && <p className="text-sm text-red-600 mt-1">{errors.venue_name}</p>}
        </div>

        <div>
          <input
            name="venue_address"
            required
            placeholder="Venue address"
            className="w-full rounded-xl border px-4 py-3"
          />
          {errors.venue_address && <p className="text-sm text-red-600 mt-1">{errors.venue_address}</p>}
        </div>

        <div>
          <input
            name="website_url"
            type="url"
            placeholder="https://example.com"
            className="w-full rounded-xl border px-4 py-3"
          />
          {errors.website_url && <p className="text-sm text-red-600 mt-1">{errors.website_url}</p>}
        </div>

        <div>
          <textarea
            name="notes"
            placeholder="Notes (optional)"
            rows={3}
            className="w-full rounded-xl border px-4 py-3"
          />
          {errors.notes && <p className="text-sm text-red-600 mt-1">{errors.notes}</p>}
        </div>

        <div>
          <input
            name="price"
            type="text"
            placeholder="Price (e.g., 12.50)"
            className="w-full rounded-xl border px-4 py-3"
          />
          <p className="text-xs text-gray-500 mt-1">Enter as dollars (e.g., &quot;12&quot; or &quot;12.50&quot;)</p>
          {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_active" defaultChecked />
          <span className="text-sm">Active</span>
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-orange-500 px-4 py-3 text-white font-medium disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create Deal'}
          </button>
          <Link href="/admin" className="rounded-xl border px-4 py-3 text-gray-700">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}

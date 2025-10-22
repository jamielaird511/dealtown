'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type FormState = {
  venue_id: number | null;
  title: string;
  description: string;
  start_time: string;  // string (empty = not set)
  end_time: string;    // string (empty = not set)
  price: string;       // string input; convert to cents on submit
  days: number[];
  is_active: boolean;
};

type LunchFormProps = {
  initial?: {
    id: string;
    venue_id: number | null;
    title: string | null;
    description: string | null;
    start_time: string | null;  // e.g. "11:00"
    end_time: string | null;    // e.g. "15:00"
    price_cents: number | null; // cents in DB
    days: number[] | null;
    is_active: boolean | null;
  };
  venues: Array<{ id: number; name: string }>;
  submitUrl: string;
  method?: 'POST' | 'PATCH';
};

export default function LunchForm({ initial, venues, submitUrl, method = 'POST' }: LunchFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    venue_id: initial?.venue_id ?? null,
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    start_time: initial?.start_time ?? '',  // null -> ''
    end_time: initial?.end_time ?? '',      // null -> ''
    price: initial?.price_cents != null ? String(initial.price_cents / 100) : '',
    days: Array.isArray(initial?.days) ? initial!.days.map(Number) : [],
    is_active: initial?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // Convert dollars (string) -> cents (int)
      const priceCents =
        form.price === '' || form.price == null
          ? null
          : Math.round(Number(form.price) * 100);

      const payload = {
        venue_id: form.venue_id,
        title: form.title.trim(),
        description: form.description.trim(),
        start_time: form.start_time ? form.start_time : null,
        end_time: form.end_time ? form.end_time : null,
        price_cents: priceCents,         // <-- send cents to API
        days: form.days,
        is_active: form.is_active,
      };

      const res = await fetch(submitUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Save failed (${res.status}): ${body}`);
      }

      // Go back to the list + refresh cache
      router.push('/admin/lunch');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const toggleDay = (d: number) => {
    setForm(f => {
      const next = f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d];
      next.sort((a, b) => a - b);
      return { ...f, days: next };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Venue */}
      <div>
        <label className="block text-sm font-medium">Venue</label>
        <select
          className="mt-1 w-full rounded border p-2"
          value={form.venue_id ?? ''}
          onChange={(e) => setForm(f => ({ ...f, venue_id: e.target.value ? Number(e.target.value) : null }))}
          required
        >
          <option value="">Select a venue…</option>
          {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          className="mt-1 w-full rounded border p-2"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          className="mt-1 w-full rounded border p-2"
          rows={4}
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
      </div>

      {/* Days */}
      <div>
        <label className="block text-sm font-medium">Days</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((label, i) => {
            const active = form.days.includes(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className={`rounded px-3 py-1 border ${active ? 'bg-black text-white' : 'bg-white'}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Times */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Start time</label>
          <input
            type="time"
            className="mt-1 w-full rounded border p-2"
            value={form.start_time ?? ''}
            onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End time</label>
          <input
            type="time"
            className="mt-1 w-full rounded border p-2"
            value={form.end_time ?? ''}
            onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
          />
        </div>
      </div>

      {/* Price ($) */}
      <div>
        <label className="block text-sm font-medium">Price ($)</label>
        <input
          type="number"
          step="0.01"
          className="mt-1 w-full rounded border p-2"
          value={form.price}
          onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
          min={0}
          placeholder="0.00"
        />
      </div>

      {/* Active */}
      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
        />
        Active
      </label>

      <div className="pt-4">
        <button type="submit" disabled={saving} className="rounded bg-orange-500 px-4 py-2 text-white disabled:opacity-60">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </form>
  );
}
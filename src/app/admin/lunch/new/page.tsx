'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type Venue = { id: string; name: string };

const DAYS = [
  { i:0, l:'Sun' },{ i:1, l:'Mon' },{ i:2, l:'Tue' },{ i:3, l:'Wed' },
  { i:4, l:'Thu' },{ i:5, l:'Fri' },{ i:6, l:'Sat' },
];

export default function NewLunchPage() {
  const [pending, setPending] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    (async () => {
      const { data } = await supabase.from('venues').select('id, name').order('name', { ascending: true });
      setVenues((data ?? []) as Venue[]);
      setLoadingVenues(false);
    })();
  }, []);

  const toggleDay = (i: number) => {
    setSelectedDays(prev =>
      prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i].sort((a,b)=>a-b)
    );
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    // attach days_of_week as array
    selectedDays.forEach(d => fd.append('days_of_week[]', String(d)));
    const body = Object.fromEntries(fd.entries());
    const res = await fetch('/api/lunch', { method: 'POST', body: JSON.stringify(body) });
    setPending(false);
    if (res.ok) window.location.href = '/admin/lunch';
    else alert('Failed to create lunch menu');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Add Lunch Menu</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input name="title" required className="w-full rounded-xl border px-3 py-2" placeholder="e.g. $15 Lunch Menu" />
        </div>

        <div>
          <label className="block text-sm mb-1">Venue</label>
          <select
            name="venue_id"
            required
            className="w-full rounded-xl border px-3 py-2 bg-white"
            disabled={loadingVenues}
            defaultValue=""
          >
            <option value="" disabled>{loadingVenues ? 'Loading venues…' : 'Select a venue'}</option>
            {venues.map(v => (<option key={v.id} value={v.id}>{v.name}</option>))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            Can't find it? Add it under <a className="underline" href="/admin/venues">Venues</a>.
          </p>
        </div>

        <div>
          <label className="block text-sm mb-1">Days</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(d => (
              <button
                type="button"
                key={d.i}
                onClick={() => toggleDay(d.i)}
                className={`px-3 py-1 rounded-full border ${selectedDays.includes(d.i) ? 'bg-orange-100' : 'bg-white'}`}
              >
                {d.l}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Leave empty if the menu is available every day.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Start time (optional)</label>
            <input name="start_time" type="time" className="w-full rounded-xl border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">End time (optional)</label>
            <input name="end_time" type="time" className="w-full rounded-xl border px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Price (optional)</label>
          <input name="price" type="number" step="1" className="w-full rounded-xl border px-3 py-2" placeholder="15" />
        </div>

        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea name="description" className="w-full rounded-xl border px-3 py-2" rows={4} placeholder="What's included in the lunch menu?" />
        </div>

        <div className="flex items-center gap-2">
          <input id="is_active" name="is_active" type="checkbox" defaultChecked />
          <label htmlFor="is_active">Active</label>
        </div>

        <button disabled={pending} className="rounded-xl border px-4 py-2 hover:bg-accent">
          {pending ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
}

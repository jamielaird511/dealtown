import { getSupabaseServerComponentClient } from '@/lib/supabaseClients';

const DAYS = [
  { i:0, l:'Sun' },{ i:1, l:'Mon' },{ i:2, l:'Tue' },{ i:3, l:'Wed' },
  { i:4, l:'Thu' },{ i:5, l:'Fri' },{ i:6, l:'Sat' },
];

export default async function EditLunchPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServerComponentClient();

  const [{ data, error }, venuesRes] = await Promise.all([
    supabase.from('lunch_menus').select('*').eq('id', params.id).single(),
    supabase.from('venues').select('id, name').order('name', { ascending: true })
  ]);

  if (error || !data) {
    return <div className="mx-auto max-w-2xl px-4 py-8">Not found.</div>;
  }

  const venues: { id: string; name: string }[] = venuesRes.data ?? [];
  const selected = (data.days_of_week ?? []) as number[];
  const has = (i: number) => selected.includes(i);

  // helper to hh:mm from possible "HH:MM:SS"
  const hhmm = (t?: string | null) => t ? t.slice(0,5) : '';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Edit Lunch Menu</h1>

      <form action={`/api/lunch/${params.id}`} method="post" className="space-y-4">
        <input type="hidden" name="_method" value="PATCH" />

        <div>
          <label className="block text-sm mb-1">Title</label>
          <input name="title" defaultValue={data.title ?? ''} className="w-full rounded-xl border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm mb-1">Venue</label>
          <select name="venue_id" defaultValue={data.venue_id} className="w-full rounded-xl border px-3 py-2 bg-white">
            {venues.map(v => (<option key={v.id} value={v.id}>{v.name}</option>))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Days</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(d => (
              <label key={d.i} className={`px-3 py-1 rounded-full border cursor-pointer ${has(d.i) ? 'bg-orange-100' : 'bg-white'}`}>
                <input type="checkbox" name="days_of_week[]" value={d.i} defaultChecked={has(d.i)} className="hidden" />
                {d.l}
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Leave all unchecked for "every day".</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Start time (optional)</label>
            <input name="start_time" type="time" defaultValue={hhmm(data.start_time)} className="w-full rounded-xl border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">End time (optional)</label>
            <input name="end_time" type="time" defaultValue={hhmm(data.end_time)} className="w-full rounded-xl border px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Price</label>
          <input name="price" type="number" step="1" defaultValue={data.price ?? ''} className="w-full rounded-xl border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea name="description" defaultValue={data.description ?? ''} className="w-full rounded-xl border px-3 py-2" rows={4} />
        </div>

        <div className="flex items-center gap-2">
          <input id="is_active" name="is_active" type="checkbox" defaultChecked={data.is_active} />
          <label htmlFor="is_active">Active</label>
        </div>

        <div className="flex gap-2">
          <button className="rounded-xl border px-4 py-2 hover:bg-accent">Save</button>
          <form action={`/api/lunch/${params.id}`} method="post" onSubmit={(e)=>{ if(!confirm('Delete this menu?')) e.preventDefault(); }}>
            <input type="hidden" name="_method" value="DELETE" />
            <button className="rounded-xl border px-4 py-2 hover:bg-red-50">Delete</button>
          </form>
        </div>
      </form>
    </div>
  );
}

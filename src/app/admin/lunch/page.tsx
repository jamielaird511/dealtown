import Link from 'next/link';
import { getSupabaseServerComponentClient } from '@/lib/supabaseClients';

function formatDays(days?: number[] | null) {
  if (!days || days.length === 0) return '—';
  const map = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return days.map(i => map[i] ?? String(i)).join(', ');
}

function to12h(hhmm?: string | null) {
  if (!hhmm) return '';
  const [h, m] = hhmm.slice(0,5).split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`;
}
function formatTimeRange(start?: string | null, end?: string | null) {
  const s = to12h(start);
  const e = to12h(end);
  if (!s && !e) return '—';
  if (s && e) return `${s} — ${e}`;
  return s || e || '—';
}

export default async function AdminLunchPage() {
  const supabase = getSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from('lunch_menus')
    .select(`
      id, title, description, price, is_active,
      days_of_week, start_time, end_time,
      venue:venues(name, address, suburb)
    `)
    .order('is_active', { ascending: false })
    .order('title', { ascending: true });

  if (error) {
    console.error('[admin lunch list] error', error);
  }

  const rows = data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lunch Menus</h1>
          <p className="text-sm text-muted-foreground">Times & days for lunch specials</p>
        </div>
        <Link
          href="/admin/lunch/new"
          className="rounded-full bg-orange-500 text-white px-4 py-2 text-sm hover:opacity-95"
        >
          Add Lunch Menu
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="py-3 pl-4 pr-2">Active</th>
              <th className="py-3 px-2">Venue</th>
              <th className="py-3 px-2">Days</th>
              <th className="py-3 px-2">Time</th>
              <th className="py-3 px-2">Price</th>
              <th className="py-3 px-2">Details</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-neutral-500">
                  No lunch menus yet.
                </td>
              </tr>
            ) : (
              rows.map((row: any) => {
                const days = formatDays(row.days_of_week);
                const time = formatTimeRange(row.start_time, row.end_time);
                return (
                  <tr key={row.id} className="border-t align-top">
                    <td className="py-4 pl-4 pr-2">
                      {row.is_active ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 px-2 py-1 text-xs font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-neutral-200 text-neutral-700 px-2 py-1 text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-2">
                      <div className="font-medium">{row.venue?.name ?? '—'}</div>
                      <div className="text-xs text-neutral-500">
                        {[row.venue?.address, row.venue?.suburb].filter(Boolean).join(', ') || '—'}
                      </div>
                      {/* Optional: show title under venue, like HH shows offer lines */}
                      {row.title && <div className="text-xs mt-1 opacity-80">{row.title}</div>}
                    </td>

                    <td className="py-4 px-2 whitespace-pre">{days}</td>
                    <td className="py-4 px-2">{time}</td>
                    <td className="py-4 px-2">
                      {row.price != null ? `— $${Number(row.price).toFixed(0)}`.replace('— ','$') : '—'}
                    </td>
                    <td className="py-4 px-2">
                      {row.description ? (
                        <div className="max-w-[34ch] whitespace-pre-line text-neutral-700">
                          {row.description}
                        </div>
                      ) : '—'}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-3">
                        <Link href={`/admin/lunch/${row.id}/edit`} className="text-blue-600 hover:underline">
                          Edit
                        </Link>
                        <form
                          action={`/api/lunch/${row.id}`}
                          method="post"
                          onSubmit={(e) => {
                            // This inline confirm matches the HH UX.
                            // @ts-ignore
                            if (!confirm('Delete this lunch menu?')) e.preventDefault();
                          }}
                        >
                          <input type="hidden" name="_method" value="DELETE" />
                          <button type="submit" className="text-red-600 hover:underline">Delete</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

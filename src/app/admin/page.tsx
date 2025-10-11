// src/app/admin/page.tsx
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { moneyFromCents } from '@/lib/money';
import { ActiveToggle } from '@/components/ActiveToggle';
import { DeleteButton } from '@/components/DeleteButton';

export default async function AdminPage({ searchParams }: { searchParams?: { ok?: string; error?: string } }) {
  const { user, supabase } = await requireAdmin();

  const { data: deals } = await supabase
    .from('deals')
    .select('id,title,day_of_week,is_active,venue_name,venue_address,website_url,notes,price_cents,created_at,updated_at')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <main className="p-6 space-y-4 max-w-7xl mx-auto">
      {/* Success/Error Messages */}
      {searchParams?.ok === '1' && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
          Success! Changes saved.
        </div>
      )}
      {searchParams?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
          {searchParams.error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin</h1>
          <p className="text-sm text-gray-600">Signed in as {user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/new" className="rounded-lg bg-orange-500 text-white px-4 py-2 font-medium">
            New Deal
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="rounded-lg bg-gray-200 px-3 py-2 text-sm">Sign out</button>
          </form>
        </div>
      </div>

      {/* Mobile: Cards, Desktop: Table */}
      <div className="space-y-3 md:space-y-0">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left text-sm font-medium">Active</th>
                <th className="p-3 text-left text-sm font-medium">Title</th>
                <th className="p-3 text-left text-sm font-medium">Venue</th>
                <th className="p-3 text-left text-sm font-medium">Day</th>
                <th className="p-3 text-left text-sm font-medium">Price</th>
                <th className="p-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(deals ?? []).map((d) => (
                <tr key={d.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <ActiveToggle id={d.id} initial={d.is_active} />
                  </td>
                  <td className="p-3">{d.title}</td>
                  <td className="p-3">
                    <div className="text-sm">{d.venue_name}</div>
                    <div className="text-xs text-gray-500">{d.venue_address}</div>
                  </td>
                  <td className="p-3 text-sm capitalize">{d.day_of_week}</td>
                  <td className="p-3 text-sm">
                    {d.price_cents ? `$${moneyFromCents(d.price_cents)}` : '—'}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/${d.id}`} className="text-sm text-blue-600 hover:underline">
                        Edit
                      </Link>
                      <DeleteButton id={d.id} title={d.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {(deals ?? []).map((d) => (
            <div key={d.id} className="rounded-xl border bg-white p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{d.title}</h3>
                  <p className="text-sm text-gray-600">{d.venue_name}</p>
                  <p className="text-xs text-gray-500">{d.venue_address}</p>
                </div>
                {d.price_cents && (
                  <span className="text-orange-600 font-semibold">${moneyFromCents(d.price_cents)}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ActiveToggle id={d.id} initial={d.is_active} />
                <span className="capitalize text-gray-600">{d.day_of_week}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <Link href={`/admin/${d.id}`} className="text-sm text-blue-600 hover:underline">
                  Edit
                </Link>
                <DeleteButton id={d.id} title={d.title} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {!deals?.length && (
        <div className="text-center p-12 text-gray-500">
          No deals yet. <Link href="/admin/new" className="text-orange-600 underline">Create one</Link>
        </div>
      )}
    </main>
  );
}

import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminVenuesPage() {
  const { user, supabase } = await requireAdmin();

  const { data: venues, error } = await supabase
    .from("venues")
    .select("id, name, address, website_url")
    .order("name", { ascending: true });

  if (error) {
    // Make failures visible while we iterate
    console.error("Admin venues query error:", error);
  }

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Venues</h1>
        <div className="flex gap-3">
          <Link href="/admin" className="text-sm text-gray-600 hover:underline">
            Back to Deals
          </Link>
          <Link href="/admin/venues/new" className="rounded-lg bg-orange-500 text-white px-4 py-2 hover:bg-orange-600">
            Add Venue
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full">
          <thead className="bg-gray-50 text-left text-sm font-medium">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Address</th>
              <th className="p-3">Website</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(venues ?? []).map(v => (
              <tr key={v.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{v.name}</td>
                <td className="p-3 text-gray-600">{v.address ?? "—"}</td>
                <td className="p-3">
                  {v.website_url ? (
                    <a href={v.website_url} className="text-blue-600 hover:underline text-sm" target="_blank" rel="noreferrer">
                      {v.website_url}
                    </a>
                  ) : "—"}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/venues/${v.id}`} className="text-blue-600 hover:underline text-sm">
                      Edit
                    </Link>
                    <form action={`/api/admin/venues/${v.id}`} method="post">
                      <input type="hidden" name="_method" value="delete" />
                      <button className="text-red-600 hover:underline text-sm" type="submit">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {!venues?.length && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  No venues yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

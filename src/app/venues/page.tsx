import Link from "next/link";
import { fetchVenues } from "@/lib/data";

export const metadata = {
  title: "Queenstown Venues | DealTown",
  description: "Browse all Queenstown venues offering deals, lunch specials, and happy hour promotions.",
  alternates: {
    canonical: "/venues",
  },
};

// Opt-out of static rendering & caching
export const dynamic = "force-dynamic";

export default async function VenuesPage() {
  const venues = await fetchVenues();

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Venues</h1>
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          Home
        </Link>
      </div>

      <div className="grid gap-3">
        {venues.map((v) => (
          <Link
            key={v.id}
            href={`/venues/${v.id}`}
            className="rounded-lg border p-4 hover:bg-gray-50 transition"
          >
            <div className="font-medium">{v.name}</div>
            {v.address && <div className="text-sm text-gray-600">{v.address}</div>}
            {v.website_url && (
              <div className="text-xs text-blue-600 underline mt-1">{v.website_url}</div>
            )}
          </Link>
        ))}
        {!venues.length && <p className="text-gray-500">No venues yet.</p>}
      </div>
    </main>
  );
}

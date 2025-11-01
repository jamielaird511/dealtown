import Link from "next/link";
import { fetchVenue, fetchVenueDeals } from "@/lib/data";
import { moneyFromCents } from "@/lib/money";
import { Metadata } from "next";

// Opt-out of static rendering & caching
export const dynamic = "force-dynamic";

type Props = { params: { id: string }; searchParams?: { day?: string } };

const days = ["today", "mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const mapDay = (d: string) =>
  (
    ({
      mon: "monday",
      tue: "tuesday",
      wed: "wednesday",
      thu: "thursday",
      fri: "friday",
      sat: "saturday",
      sun: "sunday",
    }) as any
  )[d] ?? d;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = Number(params.id);
  const venue = await fetchVenue(id);
  
  if (!venue) {
    return {
      title: "Venue Not Found | DealTown Queenstown",
      description: "The requested venue could not be found.",
      alternates: {
        canonical: `/venues/${id}`,
      },
    };
  }
  
  const title = `${venue.name} — Happy Hour & Deals | DealTown Queenstown`;
  const description = `See ${venue.name}'s happy hour times, specials, and current deals in Queenstown.`;
  
  return {
    title,
    description,
    alternates: {
      canonical: `/venues/${id}`,
    },
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function VenuePage({ params, searchParams }: Props) {
  const id = Number(params.id);
  const dayParam = searchParams?.day; // 'today' | 'mon' | ...
  const day = dayParam ? mapDay(dayParam) : undefined;

  const venue = await fetchVenue(id);
  const deals = await fetchVenueDeals(id, day);

  if (!venue) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <p className="text-gray-500">Venue not found.</p>
        <Link href="/venues" className="text-blue-600 underline">
          Back to venues
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/venues" className="text-sm text-gray-600 hover:underline">
          ← Back to venues
        </Link>
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          Home
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{venue.name}</h1>
        {venue.address && <div className="text-gray-600">{venue.address}</div>}
        {venue.website_url && (
          <a
            href={venue.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm"
          >
            {venue.website_url}
          </a>
        )}
      </div>

      {/* Day filter chips */}
      <div className="flex gap-2 flex-wrap">
        {days.map((d) => {
          const selected = (searchParams?.day ?? "today") === d;
          const href = d === "today" ? `/venues/${id}` : `/venues/${id}?day=${d}`;
          return (
            <Link
              key={d}
              href={href}
              className={`px-3 py-1 rounded-full text-sm border ${
                selected
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {d === "today" ? "Today" : d.toUpperCase()}
            </Link>
          );
        })}
      </div>

      <section className="space-y-3">
        {!deals.length && <p className="text-gray-500">No deals for this selection.</p>}
        {deals.map((d) => (
          <div key={d.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium">{d.title}</div>
                <div className="text-xs text-gray-500 capitalize">{(d as any).day_of_week}</div>
                {d.notes && <div className="text-sm text-gray-700 mt-1">{d.notes}</div>}
              </div>
              {d.price_cents != null && (
                <div className="text-orange-600 font-semibold ml-4">
                  ${moneyFromCents(d.price_cents)}
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

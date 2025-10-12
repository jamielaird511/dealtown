// src/app/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { fetchDeals, fetchFuelStations } from "@/lib/data";
import DealCard from "@/components/DealCard";
import TodayHappyHourSection from "@/components/TodayHappyHourSection";

function moneyFromCents(c: number | null | undefined) {
  if (c == null) return "N/A";
  return `$${(c / 100).toFixed(2)}`;
}

function FuelBadge({ fuel }: { fuel: string }) {
  return <span className="badge">{fuel.toUpperCase()}</span>;
}

const DAYS: { label: string; value: string }[] = [
  { label: "Today", value: "today" },
  { label: "Mon", value: "monday" },
  { label: "Tue", value: "tuesday" },
  { label: "Wed", value: "wednesday" },
  { label: "Thu", value: "thursday" },
  { label: "Fri", value: "friday" },
  { label: "Sat", value: "saturday" },
  { label: "Sun", value: "sunday" },
];

export default async function Home({ searchParams }: { searchParams?: { day?: string } }) {
  const dayParam = searchParams?.day;
  const selectedDay = (dayParam ?? "today").toLowerCase();
  const daySlug = dayParam ?? "today"; // Pass to Happy Hour section

  console.log("[page] dayParam =", dayParam, "selectedDay =", selectedDay);

  const deals = await fetchDeals(dayParam);
  const fuel = await fetchFuelStations();

  console.log(
    "[page] deals count =",
    deals?.length,
    "titles =",
    deals?.map((d) => d.title)
  );

  const grouped = fuel.reduce<Record<string, typeof fuel>>((acc, row) => {
    const key = row.name ?? `Station ${row.station_id}`;
    (acc[key] ||= []).push(row);
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
      {/* Header */}
      <header className="mb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight brand-title">DealTown</h1>
            <p className="mt-1 text-sm text-gray-500">Today's deals and local fuel prices</p>
          </div>
          <Link
            href="/venues"
            className="text-sm text-gray-600 hover:text-orange-500 transition underline"
          >
            Browse Venues
          </Link>
        </div>
      </header>

      {/* Fuel first */}
      <section aria-labelledby="fuel-heading" className="card shadow-card" id="fuel">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="fuel-heading" className="text-xl font-semibold">
            <span className="text-brand/90">Fuel</span> Prices
          </h2>
        </div>

        {fuel.length === 0 ? (
          <p className="text-sm text-gray-500">No fuel data yet.</p>
        ) : (
          <ul className="space-y-4">
            {Object.entries(grouped).map(([station, rows]) => (
              <li key={station} className="rounded-xl border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">{station}</h3>
                </div>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {rows.map((r) => (
                    <li
                      key={`${r.station_id}-${r.fuel}`}
                      className="flex items-center justify-between rounded-md bg-gray-50/70 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <FuelBadge fuel={r.fuel} />
                        <span className="text-xs text-gray-500">
                          {r.observed_at ? new Date(r.observed_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <span className="font-semibold tabular-nums text-brand">
                        {moneyFromCents(r.price_cents)}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Deals filter + list */}
      <section aria-labelledby="deals-heading" className="card shadow-card" id="deals">
        <div className="mb-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="deals-heading" className="text-xl font-semibold">
              Today's <span className="text-brand/90">Deals</span>
            </h2>
          </div>

          {/* Day buttons */}
          <ul className="flex gap-2 flex-wrap">
            {DAYS.map((d) => {
              const active = selectedDay === d.value;
              return (
                <a
                  key={d.value}
                  href={`/?day=${d.value}#deals`}
                  className={
                    active
                      ? "rounded-full px-3 py-1 bg-brand text-brandFg shadow border-brand"
                      : "rounded-full px-3 py-1 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }
                >
                  {d.label}
                </a>
              );
            })}
          </ul>
        </div>

        <div className="mt-4 space-y-3">
          {/* TEMP: raw debug to prove SSR data exists */}
          <pre className="text-xs text-gray-400">
            DEBUG: deals.length = {deals?.length ?? 0}
            {deals && deals.length > 0 && ` | First: ${deals[0]?.title}`}
          </pre>

          {/* ✅ Use the deals we just fetched. DO NOT shadow with another variable */}
          {deals && deals.length > 0 ? (
            <div className="grid gap-3">
              {deals.map((d) => (
                <DealCard key={d.id} deal={d} />
              ))}
            </div>
          ) : (
            <p className="text-black/60">No deals for {selectedDay}.</p>
          )}
        </div>
      </section>

      {/* Happy Hours */}
      <TodayHappyHourSection daySlug={daySlug} />
    </main>
  );
}

'use client';
import { useDayFilter } from '@/components/day/DayFilterContext';
import DealCard from '@/components/DealCard';
import useSWR from 'swr';
import type { Deal } from '@/types/deal';

type DealDto = {
  id: string | number;
  title: string;
  description?: string | null;
  notes?: string | null;
  website_url?: string | null;
  price_cents?: number | null;
  day_of_week: string;
  venue_id?: string | number | null;
  venue_name?: string | null;
  venue_address?: string | null;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch deals');
  return res.json();
};

export default function DealsSection() {
  const { day } = useDayFilter();
  
  const { data: all, error, isLoading } = useSWR(`/api/deals`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  // Resolve the selected day (mon..sun) using NZ time when "today"
  function nzTodayShort(): "mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun" {
    const nz = new Intl.DateTimeFormat("en-NZ", { weekday: "short", timeZone: "Pacific/Auckland" })
      .format(new Date()).toLowerCase();
    return (["sun","mon","tue","wed","thu","fri","sat"] as const)[
      new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland", weekday: "short" }) ? new Date().getDay() : 1
    ] as any; // fallback; we also map below
  }

  const shortMap: Record<string,"mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun"> =
    { mon:"mon", tue:"tue", wed:"wed", thu:"thu", fri:"fri", sat:"sat", sun:"sun", today: nzTodayShort() };
  const longMap: Record<"mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun", string> =
    { mon:"monday", tue:"tuesday", wed:"wednesday", thu:"thursday", fri:"friday", sat:"saturday", sun:"sunday" };

  const dayShort = (shortMap[day] ?? nzTodayShort());
  const dayLong  = longMap[dayShort];

  function matchesDay(row: any): boolean {
    // 1) Explicit string column (your data): day_of_week or weekday
    if (typeof row?.day_of_week === "string") {
      const v = row.day_of_week.toLowerCase().trim();
      return v === dayLong || v.startsWith(dayShort);
    }
    if (typeof row?.weekday === "string") {
      const v = row.weekday.toLowerCase().trim();
      return v === dayLong || v.startsWith(dayShort);
    }
    // 2) Array of short names
    if (Array.isArray(row?.days)) {
      return row.days.map((x: any) => String(x).toLowerCase()).includes(dayShort);
    }
    // 3) Boolean flags
    const b = row?.[dayShort] ?? row?.[`is_${dayShort}`] ?? row?.[`${dayShort}_active`];
    if (typeof b === "boolean") return !!b;
    // No day info -> include
    return true;
  }

  const deals = (Array.isArray(all) ? all : []).filter(matchesDay);

  if (process.env.NODE_ENV !== "production") {
    console.log("[deals] fetched", Array.isArray(all) ? all.length : 0, "rows; filtering for", dayShort, "/", dayLong);
  }

  if (error) {
    return (
      <section aria-labelledby="deals-heading" className="card shadow-card" id="deals">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="deals-heading" className="text-xl font-semibold">
            Today's <span className="text-brand/90">Deals</span>
          </h2>
        </div>
        <div className="text-red-600 text-sm">Error loading deals</div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section aria-labelledby="deals-heading" className="card shadow-card" id="deals">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="deals-heading" className="text-xl font-semibold">
            Today's <span className="text-brand/90">Deals</span>
          </h2>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </section>
    );
  }

  // Deals are already sorted by price_cents from the API
  // No additional sorting needed

  return (
    <section aria-labelledby="deals-heading" className="card shadow-card" id="deals">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="deals-heading" className="text-xl font-semibold">
          Today's <span className="text-brand/90">Deals</span>
        </h2>
      </div>

      <div className="mt-4 space-y-3">
        {deals.length === 0 ? (
          <p className="text-black/60">No deals for {day}.</p>
        ) : (() => {
          // Coerce venue_id to number|null to satisfy Deal type
          const normalized = deals.map((d: DealDto) => ({
            ...d,
            venue_id: d.venue_id == null ? null : Number(d.venue_id),
          })) as Deal[];
          return (
            <ul className="grid gap-3 list-none">
              {normalized.map((d) => (
                <DealCard key={d.id} deal={d} />
              ))}
            </ul>
          );
        })()}
      </div>
    </section>
  );
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const IDX_TO_KEY = ["sun","mon","tue","wed","thu","fri","sat"] as const;
type DayKey = typeof IDX_TO_KEY[number];

const DAY_IDX0 = { sun:0, mon:1, tue:2, wed:3, thu:4, fri:5, sat:6 } as const; // Sun-first 0-based
const DAY_IDX1 = { sun:7, mon:1, tue:2, wed:3, thu:4, fri:5, sat:6 } as const; // 1-based
const DAY_IDXM0 = { mon:0, tue:1, wed:2, thu:3, fri:4, sat:5, sun:6 } as const; // Mon-first 0-based

function resolveActiveKey(q: string | null): DayKey {
  const query = (q || "today").toLowerCase();
  const today: DayKey = IDX_TO_KEY[new Date().getDay()];
  return query === "today" || !(IDX_TO_KEY as readonly string[]).includes(query)
    ? today
    : (query as DayKey);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const activeKey = resolveActiveKey(url.searchParams.get("day"));
    const debug = url.searchParams.get("debug") === "1";

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase
      .from("happy_hours")
      .select(`*, venues:venue_id ( name, address, website_url )`);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const all = data ?? [];

    // ✅ FILTER BY DAYS ARRAY
    const filtered = all.filter((r: any) => {
      if (Array.isArray(r.days)) {
        return r.days.some((d: any) => {
          if (typeof d === "string") return d.toLowerCase() === activeKey;
          if (typeof d === "number") {
            // accept either 0-based (Sun=0..Sat=6) or 1-based (Mon=1..Sun=7) or Mon-first 0-based (Mon=0..Sun=6)
            return d === DAY_IDX0[activeKey] || d === DAY_IDX1[activeKey] || d === DAY_IDXM0[activeKey];
          }
          return false;
        });
      }
      // If no days array, include for now (or return false if you prefer strict)
      return true;
    });

    // NORMALIZE FIELDS
    const normalized = filtered.map((r: any) => {
      const venue = {
        name: r.venues?.name ?? "",
        address: r.venues?.address ?? "",
        website_url: r.venues?.website_url ?? "",
      };

      return {
        id: r.id,
        venue_id: r.venue_id, // ✅ Include venue_id for analytics
        title: r.title ?? "Happy Hour",
        description: r.details ?? null,
        price_cents: typeof r.price_cents === "number" ? r.price_cents : null,
        starts_at: r.start_time ?? null,
        ends_at: r.end_time ?? null,

        // keep existing flat fields (if any code uses them)
        venue_name: venue.name,
        venue_address: venue.address,
        website_url: r.website_url || venue.website_url || "",

        // ✅ add nested venues object for HappyHourCard
        venues: venue,

        // keep the days array as-is
        days: Array.isArray(r.days) ? r.days : [],
      };
    });

    // SORT BY PRICE THEN TITLE
    const priced = normalized
      .filter((r) => r.price_cents != null)
      .sort((a, b) => (a.price_cents! - b.price_cents!) || a.title.localeCompare(b.title));
    const unpriced = normalized
      .filter((r) => r.price_cents == null)
      .sort((a, b) => a.title.localeCompare(b.title));
    const items = [...priced, ...unpriced];

    // ✅ Sort by start time, then alphabetically
    items.sort((a: any, b: any) => {
      const aTime = a.starts_at ?? "";
      const bTime = b.starts_at ?? "";
      if (aTime && bTime && aTime !== bTime) return aTime.localeCompare(bTime);
      // fallback to alphabetical by venue name
      const aVenue = (a.venue_name ?? "").toLowerCase();
      const bVenue = (b.venue_name ?? "").toLowerCase();
      return aVenue.localeCompare(bVenue);
    });

    if (debug) {
      return NextResponse.json({
        debug: true,
        activeKey,
        counts: { total: all.length, matching: items.length },
        sampleRow: all[0] ? { id: all[0].id, days: all[0].days } : null,
        items
      });
    }

    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Unknown error" }, { status: 500 });
  }
}

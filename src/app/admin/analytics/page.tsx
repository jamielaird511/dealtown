// Server Component
import { supabaseAdmin } from "@/server/supabaseAdmin";

type ClickEvent = {
  id: number;
  created_at: string;
  venue_id: number | null;
  context: string | null;
  type: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  session_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  path: string | null;
};

type Venue = { id: number; name: string | null };

// NZ date helpers
function dateKeyTZ(d: Date, tz = "Pacific/Auckland") {
  // returns YYYY-MM-DD in given tz
  const fmt = new Intl.DateTimeFormat("en-NZ", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  });
  const parts = fmt.formatToParts(d);
  const year  = parts.find(p => p.type === "year")?.value ?? "1970";
  const month = parts.find(p => p.type === "month")?.value ?? "01";
  const day   = parts.find(p => p.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

function formatDateNZ(d: Date) {
  return d.toLocaleDateString("en-NZ", { timeZone: "Pacific/Auckland", month: "short", day: "numeric" });
}

export default async function AnalyticsPage() {
  // 14-day window (NZT)
  const now = new Date();
  const since = new Date(Date.now() - 14 * 86400000);

  let events: ClickEvent[] = [];
  let venues: Venue[] = [];
  let errorMsg: string | null = null;

  try {
    const sb = supabaseAdmin();

    // Pull recent click events (cap to reasonable size)
    const { data: ev, error: e1 } = await sb
      .from("click_events")
      .select("id, created_at, venue_id, context, type, country, city, region, session_id, entity_type, entity_id, path")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(5000);
    if (e1) throw e1;
    events = ev ?? [];

    // Pull venue names for labels
    const venueIds = Array.from(new Set(events.map(e => e.venue_id).filter(Boolean))) as number[];
    if (venueIds.length > 0) {
      const { data: v, error: e2 } = await sb
        .from("venues")
        .select("id, name")
        .in("id", venueIds);
      if (e2) throw e2;
      venues = v ?? [];
    }

    // Collect ids per entity type and resolve titles
    const ids = { deal: new Set<number>(), happy_hour: new Set<number>(), lunch: new Set<number>() };
    for (const e of events as any[]) {
      if (e.entity_type && e.entity_id) {
        const n = Number(e.entity_id);
        if (Number.isFinite(n) && (e.entity_type === "deal" || e.entity_type === "happy_hour" || e.entity_type === "lunch")) {
          ids[e.entity_type].add(n);
        }
      }
    }

    // Look up titles/names
    const labels = new Map<string, string>(); // key `${type}:${id}` -> label

    if (ids.deal.size) {
      const { data } = await sb.from("deals").select("id,title").in("id", Array.from(ids.deal));
      data?.forEach((r:any) => labels.set(`deal:${r.id}`, r.title ?? `Deal ${r.id}`));
    }
    if (ids.happy_hour.size) {
      const { data } = await sb.from("happy_hours").select("id,title,venue_name").in("id", Array.from(ids.happy_hour));
      data?.forEach((r:any) => labels.set(`happy_hour:${r.id}`, r.title ?? r.venue_name ?? `Happy Hour ${r.id}`));
    }
    if (ids.lunch.size) {
      const { data } = await sb.from("lunch_specials").select("id,title,venue_name").in("id", Array.from(ids.lunch));
      data?.forEach((r:any) => labels.set(`lunch:${r.id}`, r.title ?? r.venue_name ?? `Lunch ${r.id}`));
    }
  } catch (err: any) {
    errorMsg = err?.message ?? "Failed to load analytics data.";
  }

  // Early render if env missing or query failed
  if (errorMsg) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="mt-4 text-sm text-red-600">
          {errorMsg}. Ensure <code>SUPABASE_SERVICE_ROLE_KEY</code> and <code>NEXT_PUBLIC_SUPABASE_URL</code> are set in Vercel.
        </p>
      </div>
    );
  }

  // --- Aggregate ---
  // by venue
  const venueName = new Map<number, string>();
  venues.forEach(v => {
    if (v?.id != null) venueName.set(v.id, v.name ?? `Venue ${v.id}`);
  });

  const byVenue = new Map<number, number>();
  events.forEach(e => {
    if (e.venue_id != null) {
      byVenue.set(e.venue_id, (byVenue.get(e.venue_id) ?? 0) + 1);
    }
  });

  const topVenues = Array.from(byVenue.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([id, count]) => ({
      id,
      name: venueName.get(id) ?? `Venue ${id}`,
      count,
    }));

  // by day (total) — seed last 14 days in NZT to avoid gaps
  const byDay = new Map<string, number>();
  for (let i = 14; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    byDay.set(dateKeyTZ(d), 0);
  }
  events.forEach(e => {
    if (!e?.created_at) return;
    const d = new Date(e.created_at);
    if (Number.isNaN(d.getTime())) return; // skip bad rows
    const key = dateKeyTZ(d);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  });
  const daily = Array.from(byDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, count]) => ({ day, count }));

  // KPIs
  const totalClicks = events.length;
  const uniqueVenues = byVenue.size;
  const uniqueSessions = new Set(events.map((e:any) => e.session_id).filter(Boolean)).size;

  // Type breakdown
  const countsByType = events.reduce((acc, e) => {
    const k = e.type ?? "unknown";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // --- Locations (top 10) ---
  const byLocation: Record<string, number> = {};
  for (const e of events) {
    const loc = [ (e as any).city, (e as any).country ].filter(Boolean).join(", ");
    const key = loc || "Unknown";
    byLocation[key] = (byLocation[key] ?? 0) + 1;
  }
  const topLocations = Object.entries(byLocation).sort((a,b)=>b[1]-a[1]).slice(0,10);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <span className="text-sm text-muted-foreground">
          Last 14 days • Updated now
        </span>
      </div>

      {/* KPI cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Total clicks</div>
          <div className="mt-1 text-2xl font-semibold">{totalClicks}</div>
        </div>
        <div className="rounded-2xl border p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Visitors (unique sessions)</div>
          <div className="mt-1 text-2xl font-semibold">{uniqueSessions}</div>
        </div>
        <div className="rounded-2xl border p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Venues clicked</div>
          <div className="mt-1 text-2xl font-semibold">{uniqueVenues}</div>
        </div>
        <div className="rounded-2xl border p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Window</div>
          <div className="mt-1 text-2xl font-semibold">
            {formatDateNZ(since)} – {formatDateNZ(now)}
          </div>
        </div>
        <div className="rounded-2xl border p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Breakdown</div>
          <div className="mt-1 text-sm">
            <div>Address: <span className="font-medium">{countsByType["address"] ?? 0}</span></div>
            <div>Share: <span className="font-medium">{countsByType["share"] ?? 0}</span></div>
            <div>Pageviews: <span className="font-medium">{countsByType["pageview"] ?? 0}</span></div>
          </div>
        </div>
      </div>

      {/* Top venues */}
      <div className="mt-8">
        <h2 className="text-lg font-medium">Top venues by clicks</h2>
        <div className="mt-3 rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2 w-12">#</th>
                <th className="text-left px-3 py-2">Venue</th>
                <th className="text-right px-3 py-2">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {topVenues.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                    No clicks yet.
                  </td>
                </tr>
              ) : (
                topVenues.map((v, i) => (
                  <tr key={v.id} className="border-t">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">{v.name}</td>
                    <td className="px-3 py-2 text-right font-medium">{v.count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily totals */}
      <div className="mt-8">
        <h2 className="text-lg font-medium">Daily clicks</h2>
        <div className="mt-3 rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-right px-3 py-2">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((d) => {
                const y = Number(d.day.slice(0,4));
                const m = Number(d.day.slice(5,7)) - 1;
                const dd = Number(d.day.slice(8,10));
                const label = formatDateNZ(new Date(y, m, dd));
                return (
                  <tr key={d.day} className="border-t">
                    <td className="px-3 py-2">{label}</td>
                    <td className="px-3 py-2 text-right">{d.count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top locations */}
      <div className="mt-8">
        <h2 className="text-lg font-medium">Top locations</h2>
        <div className="mt-3 rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2">Location</th>
                <th className="text-right px-3 py-2">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {topLocations.length === 0 ? (
                <tr><td colSpan={2} className="px-3 py-6 text-center text-muted-foreground">No clicks yet.</td></tr>
              ) : (
                topLocations.map(([loc, count]) => (
                  <tr key={loc} className="border-t">
                    <td className="px-3 py-2">{loc}</td>
                    <td className="px-3 py-2 text-right">{count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent clicks (most recent 50) */}
      <div className="mt-8">
        <h2 className="text-lg font-medium">Recent clicks</h2>
        <div className="mt-3 rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2">When</th>
                <th className="text-left px-3 py-2">Type</th>
                <th className="text-left px-3 py-2">What</th>
                <th className="text-right px-3 py-2">Venue</th>
              </tr>
            </thead>
            <tbody>
              {(events.slice(0,50) as any[]).map((e) => {
                const key = e.entity_type && e.entity_id ? `${e.entity_type}:${Number(e.entity_id)}` : "";
                const what = key ? (labels.get(key) ?? key) : (e.target_url ?? "");
                const when = new Date(e.created_at);
                return (
                  <tr key={e.id} className="border-t">
                    <td className="px-3 py-2">{formatDateNZ(when)}</td>
                    <td className="px-3 py-2">{e.type}</td>
                    <td className="px-3 py-2">{what}</td>
                    <td className="px-3 py-2 text-right">{e.venue_id ?? ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* TODO next: context split (happy_hour / deal / lunch), per-day per-venue chart */}
    </div>
  );
}

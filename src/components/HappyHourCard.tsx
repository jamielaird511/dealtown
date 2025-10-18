import ShareButton from "@/components/ShareButton";

type Venue = { name?: string; address?: string; website_url?: string };
type HH = {
  id: string;
  title?: string | null;
  description?: string | null;
  starts_at?: string | null; // "16:00:00"
  ends_at?: string | null;
  website_url?: string | null;
  venues?: Venue;
};

function fmt(hms?: string | null) {
  if (!hms) return null;
  const [h, m] = hms.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const ap = h >= 12 ? "pm" : "am";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${m.toString().padStart(2, "0")} ${ap}`;
}
function range(a?: string | null, b?: string | null) {
  const s = fmt(a), e = fmt(b);
  if (s && e) return `${s} – ${e}`;
  if (s) return `${s} onwards`;
  if (e) return `until ${e}`;
  return null;
}

export default function HappyHourCard({ hh }: { hh: HH }) {
  const venue = hh.venues ?? {};
  const venueName = venue.name ?? "Unknown venue";
  const venueAddress = venue.address ?? "";
  const website = hh.website_url || venue.website_url || undefined;
  const timeRange = range(hh.starts_at, hh.ends_at);

  return (
    <article className="rounded-2xl border p-3 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{venueName}</h3>
        {venueAddress && <p className="text-sm text-gray-600">{venueAddress}</p>}
        </div>
        <ShareButton
          venueName={venueName}
          description={hh.description}
          website={website ?? null}
          timeRange={timeRange}
        />
      </div>

      <div className="mt-3 space-y-2">
        {timeRange && (
          <div className="inline-flex items-center gap-2 text-sm">
            <span
              className="
                inline-flex items-center rounded-full
                px-3 py-1 text-sm font-medium
                bg-orange-50 text-orange-700 ring-1 ring-orange-200
                hover:bg-orange-100
              "
            >
              {timeRange}
            </span>
          </div>
        )}

        {/* show notes only if present */}
        {hh.description && <p className="text-sm">{hh.description}</p>}
      </div>

      {website && (
        <div className="mt-3">
          <a href={website} target="_blank" rel="noreferrer" className="text-sm underline">
            Website
          </a>
        </div>
      )}
    </article>
  );
}

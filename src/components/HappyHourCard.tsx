import ShareButton from "@/components/ui/ShareButton";
import TrackableAddress from "@/components/ui/TrackableAddress";

type Venue = { name?: string; address?: string; website_url?: string };
type HH = {
  id: string;
  venue_id?: number | null;
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
    <article className="card card-hover">
      <div className="p-5 md:p-6">
        {/* Header: name + time pill */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold">{venueName}</h3>
          {timeRange && (
            <span className="shrink-0 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-orange-50 text-orange-700 ring-1 ring-orange-200">
              {timeRange}
            </span>
          )}
        </div>

        {/* Address (full width) */}
        {venueAddress && (
          <div className="mt-1 text-xs text-gray-500">
            <TrackableAddress 
              address={venueAddress} 
              venueId={hh.venue_id} 
              context="happy_hour"
              entityType="happy_hour"
              entityId={hh.id}
            />
          </div>
        )}

        {/* Title (optional) */}
        {hh.title && <p className="mt-3 text-base font-semibold text-orange-500">{hh.title}</p>}

        {/* Description (full width) */}
        {hh.description && <p className="mt-2 text-sm text-gray-700">{hh.description}</p>}

        {/* Footer actions */}
        <div className="mt-4 flex items-center gap-4">
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 underline"
            >
              Visit website
            </a>
          )}
          <ShareButton
            variant="pill"
            title={`Happy Hour at ${venueName} – DealTown`}
            text={`Happy Hour: ${hh.title ?? "Great specials"} at ${venueName}`}
            entityType="happy_hour"
            entityId={hh.id}
          />
        </div>
      </div>
    </article>
  );
}

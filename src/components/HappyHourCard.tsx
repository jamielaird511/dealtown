import { Share2, ExternalLink } from "lucide-react";

type Venue = {
  name?: string;
  address?: string;
  website_url?: string;
};

type HH = {
  id: number;
  start_time: string;
  end_time: string;
  details?: string;
  is_active?: boolean;
  website_url?: string;
  venues?: Venue | null;
};

function fmtTime(t: string): string {
  if (!t) return "";
  // "16:00:00" → "4:00 PM"
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export default function HappyHourCard({ hh }: { hh: HH }) {
  const venue = hh.venues ?? {};
  const venueName = (venue as Venue).name ?? "Unknown venue";
  const venueAddress = (venue as Venue).address ?? "";
  const website = hh.website_url || (venue as Venue).website_url;
  const timeRange = `${fmtTime(hh.start_time)}–${fmtTime(hh.end_time)}`;

  async function onShare() {
    const text = `${hh.details || "Happy Hour"} at ${venueName} • ${timeRange}`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Happy Hour", text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        alert("Copied to clipboard!");
      }
    } catch {
      // User cancelled or error
    }
  }

  return (
    <article className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold truncate">{venueName}</h3>
          {venueAddress && <p className="text-sm text-gray-600 truncate">{venueAddress}</p>}
        </div>
        <button
          onClick={onShare}
          className="shrink-0 rounded-full p-2 hover:bg-gray-100"
          type="button"
          aria-label="Share"
        >
          <Share2 size={18} className="text-gray-600" />
        </button>
      </div>

      <div className="mt-3 space-y-2">
        <p className="text-sm font-medium text-orange-600">{timeRange}</p>
        {hh.details && <p className="text-sm text-gray-700">{hh.details}</p>}
      </div>

      {website && (
        <a
          href={website}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <ExternalLink size={14} />
          Website
        </a>
      )}
    </article>
  );
}

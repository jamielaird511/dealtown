"use client";
import { Share2 } from "lucide-react";

type HH = {
  id: string;
  title?: string | null; // Optional, e.g. "$8 House Pints"
  details?: string | null; // e.g. "All house beers and wines"
  price_cents?: number | null;
  start_time: string; // "16:00:00"
  end_time: string; // "18:00:00"
  website_url?: string | null; // Optional override
  venues?: {
    id: number;
    name: string;
    address?: string | null;
    website_url?: string | null;
  } | null;
};

function fmtTime(t: string) {
  // "16:00:00" → "16:00" (keep your existing 24h style)
  return t?.slice(0, 5) || t;
}
function money(c?: number | null) {
  if (c == null) return null;
  return `$${(c / 100).toFixed(2)}`;
}

export default function HappyHourCard({ hh }: { hh: HH }) {
  const venue = hh.venues ?? {};
  const venueName = venue.name ?? "Unknown venue";
  const venueAddress = venue.address ?? "";
  const website = hh.website_url || venue.website_url; // prefer HH, fallback to venue
  const timeRange = `${fmtTime(hh.start_time)}–${fmtTime(hh.end_time)}`;
  const price = money(hh.price_cents);

  // Share payload focuses on venue + time (quick context)
  const shareText =
    `🍻 Happy Hour at ${venueName} ${timeRange} — ${hh.title || ""} ${price || ""}`.trim();
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Happy Hour • ${venueName}`,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`.trim());
        alert("Copied to clipboard!");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <article className="rounded-2xl border p-4 shadow-sm">
      {/* Top row: Venue (bold) and Time on the right */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-lg font-semibold truncate">{venueName}</h4>
          {venueAddress && <div className="text-sm text-gray-600 truncate">{venueAddress}</div>}
        </div>
        <div className="text-sm text-gray-700 whitespace-nowrap">{timeRange}</div>
      </div>

      {/* Offer line: optional price + title */}
      {(hh.title || price) && (
        <div className="mt-2 text-[15px]">
          {price ? <span className="text-orange-500 font-semibold">{price}</span> : null}
          {price && hh.title ? <span className="mx-1">•</span> : null}
          {hh.title ? <span className="font-medium">{hh.title}</span> : null}
        </div>
      )}

      {/* Details (optional) */}
      {hh.details && <div className="mt-1 text-sm text-gray-600">{hh.details}</div>}

      {/* Footer actions */}
      <div className="mt-2 flex items-center gap-4">
        {website && (
          <a href={website} target="_blank" rel="noreferrer" className="text-sm underline">
            Website
          </a>
        )}

        <button
          onClick={handleShare}
          className="ml-auto inline-flex items-center gap-1 text-gray-600 hover:text-orange-500 transition"
          title="Share"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm">Share</span>
        </button>
      </div>
    </article>
  );
}

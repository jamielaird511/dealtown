"use client";
import { Clock, MapPin, Share2, MapPinned } from "lucide-react";

export interface DealCardProps {
  title: string;
  priceCents?: number | null;
  venue: string;
  suburb?: string | null;
  description?: string | null;
  window?: string | null; // e.g., "Fri 4:00–6:00 PM"
}

function dollars(cents?: number | null) {
  if (cents == null || cents === 0) return "";
  return `$${(cents / 100).toFixed(2)}`;
}

export default function DealCard({
  title,
  priceCents,
  venue,
  suburb,
  description,
  window,
}: DealCardProps) {
  const price = dollars(priceCents);
  const shareText = `${title}${price ? ` — ${price}` : ""} @ ${venue}${suburb ? `, ${suburb}` : ""}${window ? ` • ${window}` : ""}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue} ${suburb || ""}`)}`;

  return (
    <article className="card card-hover p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug">{title}</h3>
        {price ? <span className="badge-price">{price}</span> : null}
      </div>

      <div className="mt-1 flex items-center gap-1 text-sm muted">
        <MapPin className="h-4 w-4" />
        <span className="truncate">
          {venue} {suburb ? <span className="opacity-70">• {suburb}</span> : null}
        </span>
      </div>

      {description ? (
        <p className="mt-2 text-sm text-neutral-700 line-clamp-2">{description}</p>
      ) : null}

      {window ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
          <Clock className="h-4 w-4" />
          <span className="truncate">{window}</span>
        </div>
      ) : null}

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => navigator.clipboard.writeText(shareText)}
          className="btn"
          aria-label="Share deal"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </button>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          aria-label="Open in maps"
        >
          <MapPinned className="h-3.5 w-3.5" />
          Maps
        </a>
      </div>
    </article>
  );
}

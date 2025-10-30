// src/components/DealCard.tsx
import { ExternalLink } from "lucide-react";
import ShareButton from "@/components/ui/ShareButton";
import TrackableAddress from "@/components/ui/TrackableAddress";
import { normalizeHttpUrl } from "@/lib/url";

type Deal = {
  id: string | number;
  venue_id?: number | null;
  title: string;
  description?: string | null; // unified view field
  notes?: string | null;       // fallback if any legacy view returns this
  website_url?: string | null;
  price_cents?: number | null;
  venue_name?: string | null;
  venue_address?: string | null;
  venue?: { id?: number; name?: string; address?: string; website?: string; website_url?: string } | null;
  category?: string | null;
};

function formatCents(cents?: number | null) {
  if (cents == null) return null;
  return `$${(cents / 100).toFixed(2)}`;
}

export default function DealCard({ deal }: { deal: Deal }) {
  const price = formatCents(deal.price_cents);
  const desc = deal.description ?? deal.notes ?? null;
  const venueWebsite = normalizeHttpUrl(
    deal?.website_url ??
    deal?.venue?.website ??
    deal?.venue?.website_url
  );

  return (
    <li className="card card-hover">
      <div className="p-5 md:p-6">
        {/* Header: venue name + price badge */}
        <div className="flex items-start justify-between gap-3">
          {deal.venue_name && (
            <div className="text-base font-semibold text-gray-900">{deal.venue_name}</div>
          )}
          {price && (
            <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600">
              {price}
            </span>
          )}
        </div>

        {/* Address (full width) */}
        {deal.venue_address && (
          <div className="mt-1 text-xs text-gray-500">
            <TrackableAddress 
              address={deal.venue_address} 
              venueId={deal.venue_id} 
              context="deal"
              entityType="deal"
              entityId={deal.id}
            />
          </div>
        )}

        {/* Deal title */}
        <h3 className="mt-1 text-sm font-medium text-gray-900">{deal.title}</h3>

        {/* Description (full width) */}
        {desc && <p className="mt-2 text-sm text-gray-700">{desc}</p>}

        {/* Footer actions */}
        <div className="mt-4 flex items-center gap-4">
          {venueWebsite && (
            <a
              href={venueWebsite}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                (window as any)?.analytics?.track?.("venue_website_click", {
                  venue_id: deal?.venue_id ?? deal?.venue?.id ?? null,
                  deal_id: deal?.id ?? null,
                  category: deal?.category ?? null,
                })
              }
              className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 underline"
            >
              Visit website <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <ShareButton
            variant="pill"
            title={`${deal.title} at ${deal.venue_name} – DealTown`}
            text={`Found a deal at ${deal.venue_name}`}
            entityType="deal"
            entityId={deal.id}
          />
        </div>
      </div>
    </li>
  );
}

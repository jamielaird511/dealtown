import React from 'react';
import { ExternalLink } from "lucide-react";
import ShareButton from './ShareButton';
import TrackableAddress from './TrackableAddress';
import { normalizeHttpUrl } from '@/lib/url';

export type DealCardProps = {
  venueName: string | null;
  addressLine: string | null;
  venueId?: number | null;
  dealTitle: string | null;       // e.g., "Taco Tuesday"
  notes?: string | null;          // description / fine print
  badgeText?: string;             // e.g., "$15.00"
  context?: "deal" | "happy_hour" | "lunch";
  id?: string | number;           // for impression tracking
  venueWebsite?: string | null;   // venue website URL
};

export default function DealCard({
  venueName,
  addressLine,
  venueId,
  dealTitle,
  notes,
  badgeText,
  context = "deal",
  id,
  venueWebsite,
}: DealCardProps) {
  const normalizedWebsite = normalizeHttpUrl(venueWebsite);
  return (
    <li className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm" data-id={id}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* Venue */}
          <h3 className="text-lg font-semibold text-neutral-900 truncate">
            {venueName || 'Untitled Venue'}
          </h3>

          {/* Address */}
          {addressLine ? (
            <div className="mt-1 text-sm text-neutral-500">
              <TrackableAddress 
                address={addressLine} 
                venueId={venueId} 
                context={context}
                entityType={context}
                entityId={id}
              />
            </div>
          ) : null}

          {/* Deal title in orange */}
          {dealTitle ? (
            <div className="mt-3 text-base font-semibold text-orange-500">
              {dealTitle}
            </div>
          ) : null}

          {/* Notes */}
          {notes ? (
            <p className="mt-1 text-sm text-neutral-700">{notes}</p>
          ) : null}

          {/* Website link */}
          {normalizedWebsite && (
            <a
              href={normalizedWebsite}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                (window as any)?.analytics?.track?.("venue_website_click", {
                  venue_id: venueId ?? null,
                  deal_id: id ?? null,
                  category: context ?? null,
                })
              }
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gray-900 hover:underline"
            >
              Visit website <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        {/* Price badge (optional) */}
        {badgeText ? (
          <div className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600">
            {badgeText}
          </div>
        ) : null}
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-4">
        <ShareButton
          variant="pill"
          title={`${dealTitle || 'Deal'} at ${venueName} – DealTown`}
          text={`Found a deal at ${venueName}`}
          entityType={context}
          entityId={id}
        />
      </div>
    </li>
  );
}


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
    <li className="card card-hover" data-id={id}>
      <div className="p-5 md:p-6">
        {/* Header: venue name + badge */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-gray-900">
            {venueName || 'Untitled Venue'}
          </h3>
          {badgeText && (
            <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600">
              {badgeText}
            </span>
          )}
        </div>

        {/* Address (full width) */}
        {addressLine && (
          <div className="mt-1 text-xs text-gray-500">
            <TrackableAddress 
              address={addressLine} 
              venueId={venueId} 
              context={context}
              entityType={context}
              entityId={id}
            />
          </div>
        )}

        {/* Deal title */}
        {dealTitle && (
          <p className="mt-3 text-base font-semibold text-orange-500">{dealTitle}</p>
        )}

        {/* Notes */}
        {notes && <p className="mt-2 text-sm text-gray-700">{notes}</p>}

        {/* Footer actions */}
        <div className="mt-4 flex items-center gap-4">
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
              className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 underline"
            >
              Visit website <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <ShareButton
            variant="pill"
            title={`${dealTitle || 'Deal'} at ${venueName} – DealTown`}
            text={`Found a deal at ${venueName}`}
            entityType={context}
            entityId={id}
          />
        </div>
      </div>
    </li>
  );
}


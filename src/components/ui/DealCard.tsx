import React from 'react';

export type DealCardProps = {
  venueName: string | null;
  addressLine: string | null;
  dealTitle: string | null;       // e.g., "Taco Tuesday"
  notes?: string | null;          // description / fine print
  badgeText?: string;             // e.g., "$15.00"
};

export default function DealCard({
  venueName,
  addressLine,
  dealTitle,
  notes,
  badgeText,
}: DealCardProps) {
  return (
    <li className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* Venue */}
          <h3 className="text-lg font-semibold text-neutral-900 truncate">
            {venueName || 'Untitled Venue'}
          </h3>

          {/* Address */}
          {addressLine ? (
            <div className="mt-1 text-sm text-neutral-500">{addressLine}</div>
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
        </div>

        {/* Price badge (optional) */}
        {badgeText ? (
          <div className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600">
            {badgeText}
          </div>
        ) : null}
      </div>
    </li>
  );
}


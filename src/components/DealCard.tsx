// src/components/DealCard.tsx
import ShareButton from "@/components/ui/ShareButton";
type Deal = {
  id: string | number;
  title: string;
  description?: string | null; // unified view field
  notes?: string | null;       // fallback if any legacy view returns this
  website_url?: string | null;
  price_cents?: number | null;
  venue_name?: string | null;
  venue_address?: string | null;
};

function formatCents(cents?: number | null) {
  if (cents == null) return null;
  return `$${(cents / 100).toFixed(2)}`;
}

export default function DealCard({ deal }: { deal: Deal }) {
  const price = formatCents(deal.price_cents);
  const desc = deal.description ?? deal.notes ?? null;

  return (
    <li className="rounded-lg border p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        {/* LEFT: content */}
        <div className="min-w-0">
          {/* Venue first (prominent) */}
          {deal.venue_name && (
            <div className="text-base font-semibold text-gray-900">
              {deal.venue_name}
            </div>
          )}
          {/* Address (subtle) */}
          {deal.venue_address && (
            <div className="text-xs text-gray-500">
              {deal.venue_address}
            </div>
          )}

          {/* Deal title */}
          <h3 className="mt-1 text-sm font-medium text-gray-900">
            {deal.title}
          </h3>

          {/* Description / notes */}
          {desc && (
            <p className="mt-1 text-sm text-gray-700">
              {desc}
            </p>
          )}

          {/* Website link (optional) */}
          {deal.website_url && (
            <a
              href={deal.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center text-xs text-blue-600 hover:underline"
            >
              Website
            </a>
          )}
        </div>

        {/* RIGHT: price badge (if any) */}
        {price && (
          <div className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600">
            {price}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-4">
        <ShareButton
          variant="pill"
          title={`${deal.title} at ${deal.venue_name} – DealTown`}
          text={`Found a deal at ${deal.venue_name}`}
        />
      </div>
    </li>
  );
}

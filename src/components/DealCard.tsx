// src/components/DealCard.tsx
"use client";

import { ExternalLink, Share2 } from "lucide-react";
import { moneyFromCents } from "@/lib/data";

export type DealCardProps = {
  deal: {
    id: number;
    title: string;
    venue_name?: string | null;
    venue_address?: string | null;
    notes?: string | null;
    website_url?: string | null;
    price_cents?: number | null;
  };
};

export default function DealCard({ deal }: DealCardProps) {
  const onShare = async () => {
    const text = `${deal.title}${deal.venue_name ? ` @ ${deal.venue_name}` : ""}${
      deal.price_cents != null ? ` — ${moneyFromCents(deal.price_cents)}` : ""
    }`;
    const url = typeof window !== "undefined" ? window.location.href : "";

    try {
      if (navigator.share) {
        await navigator.share({ title: "DealTown", text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        alert("Copied to clipboard!");
      }
    } catch {
      // no-op if user cancels
    }
  };

  return (
    <article className="rounded-xl border bg-white/70 shadow-sm p-4 flex flex-col gap-2 hover:bg-neutral-50 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {deal.venue_name && (
            <h3 className="font-semibold text-lg truncate">{deal.venue_name}</h3>
          )}
          {deal.venue_address && (
            <p className="text-sm text-black/60 truncate">{deal.venue_address}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {(deal as any).label && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              {(deal as any).label}
            </span>
          )}
          {(deal as any).effective_price_cents != null && (
            <span className="text-orange-600 font-semibold">
              ${moneyFromCents((deal as any).effective_price_cents)}
            </span>
          )}
        </div>
      </div>

      <p className="text-[15px]">{deal.title}</p>

      {deal.notes && (
        <p className="text-sm text-black/70">{deal.notes}</p>
      )}

      <div className="mt-1 flex items-center gap-3">
        {deal.website_url && (
          <a
            href={deal.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-black/70 hover:text-black underline"
          >
            <ExternalLink size={16} />
            Website
          </a>
        )}
        <button
          onClick={onShare}
          className="ml-auto inline-flex items-center gap-1 text-sm rounded-full px-3 py-1 border hover:bg-neutral-100"
          type="button"
        >
          <Share2 size={16} />
          Share
        </button>
      </div>
    </article>
  );
}

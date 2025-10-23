"use client";
import { MapPin } from "lucide-react";
import { logEvent } from "@/lib/analytics";

function mapsUrlFromAddress(address: string) {
  const q = encodeURIComponent(address ?? "");
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export default function TrackableAddress({
  address, venueId, context, entityType, entityId, className,
}: {
  address: string;
  venueId?: number | null;
  context?: "deal" | "happy_hour" | "lunch";
  entityType?: "deal" | "happy_hour" | "lunch";
  entityId?: number | string | null;
  className?: string;
}) {
  const href = mapsUrlFromAddress(address);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={
        className ??
        "group inline-flex items-center gap-1 text-sm text-gray-700 hover:text-orange-600 font-medium transition-colors"
      }
      onClick={() =>
        logEvent({
          type: "address",
          category: "engagement",
          action: "click",
          label: "address_link",
          venue_id: venueId ?? null,
          entity_type: entityType ?? context ?? null,
          entity_id: entityId ?? null,
          target_url: href,
          context,
        })
      }
    >
      <MapPin size={14} className="text-gray-500 group-hover:text-orange-500 transition-colors" />
      <span>{address}</span>
    </a>
  );
}

"use client";
import { MapPin } from "lucide-react";

function mapsUrlFromAddress(address: string) {
  const q = encodeURIComponent(address ?? "");
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

async function logClick(body: any) {
  try {
    const url = "/api/track-click";
    const json = JSON.stringify(body);
    if ("sendBeacon" in navigator) {
      const blob = new Blob([json], { type: "application/json" });
      (navigator as any).sendBeacon(url, blob);
      return;
    }
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: json, keepalive: true });
  } catch { /* never block navigation */ }
}

export default function TrackableAddress({ address, venueId, context, className }: {
  address: string; venueId?: number|null; context?: "deal"|"happy_hour"|"lunch"; className?: string;
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
      onClick={() => logClick({ type: "address", venue_id: venueId ?? null, target_url: href, context })}
    >
      <MapPin size={14} className="text-gray-500 group-hover:text-orange-500 transition-colors" />
      <span>{address}</span>
    </a>
  );
}

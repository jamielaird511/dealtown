"use client";

import { Share2 } from "lucide-react";

export default function ShareButton({
  venueName,
  description,
  website,
  timeRange,
}: {
  venueName: string;
  description?: string | null;
  website?: string | null;
  timeRange?: string | null;
}) {
  const share = async () => {
    try {
      const text =
        `${venueName} — Happy Hour` +
        (timeRange ? ` (${timeRange})` : "") +
        (description ? `\n${description}` : "");
      const url = website || window.location.href;

      if (navigator.share) {
        await navigator.share({ title: `${venueName} Happy Hour`, text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        alert("Link copied to clipboard");
      }
    } catch {
      /* user canceled */
    }
  };

  return (
    <button
      type="button"
      aria-label="Share Happy Hour"
      onClick={share}
      className="text-gray-400 hover:text-gray-600 transition"
    >
      <Share2 size={18} />
    </button>
  );
}


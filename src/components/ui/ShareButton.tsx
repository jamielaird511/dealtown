"use client";

import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { logEvent } from "@/lib/analytics"; // central helper

type Props = {
  className?: string;
  title: string;
  url?: string;               // optional explicit URL; falls back to location.href
  text?: string;
  entityType?: "deal" | "happy_hour" | "lunch";
  entityId?: number | string;
  variant?: "link" | "pill";
};

export default function ShareButton({
  className,
  title,
  url,
  text,
  entityType,
  entityId,
  variant = "pill",
}: Props) {
  async function handleClick() {
    const targetUrl = url ?? window.location.href;
    const shareText = text ?? title;

    // default so we always send a method
    let method: "system" | "copy" = "copy";

    try {
      if (navigator.share) {
        method = "system";
        await navigator.share({ title, text: shareText, url: targetUrl });
        // success → log share
        await logEvent({
          type: "share",
          category: "engagement",
          action: "share",
          label: "share_button",
          entity_type: entityType ?? null,
          entity_id: entityId ?? null,
          target_url: targetUrl,
          method,
        });
        return;
      }

      // Fallback: copy URL to clipboard
      await navigator.clipboard.writeText(targetUrl);
      await logEvent({
        type: "share",
        category: "engagement",
        action: "share",
        label: "share_button",
        entity_type: entityType ?? null,
        entity_id: entityId ?? null,
        target_url: targetUrl,
        method,
      });
    } catch (err) {
      // User cancelled native sheet or copy failed → still useful to know
      await logEvent({
        type: "share",
        category: "engagement",
        action: "share_cancel",
        label: "share_button",
        entity_type: entityType ?? null,
        entity_id: entityId ?? null,
        target_url: targetUrl,
        method,
      });
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        variant === "pill"
          ? "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium bg-orange-500 text-white shadow hover:opacity-90 active:translate-y-px"
          : "inline-flex items-center gap-1 underline underline-offset-2",
        className
      )}
      aria-label="Share this"
    >
      <Share2 className="h-4 w-4" aria-hidden />
      <span>Share</span>
    </button>
  );
}

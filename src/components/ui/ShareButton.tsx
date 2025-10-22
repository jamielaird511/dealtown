"use client";
import * as React from "react";
import { Share2 } from "lucide-react";
import { buildShareUrl, copyToClipboard, type SharePayload } from "@/lib/utils/share";

type Props = {
  title?: string;
  text?: string;
  url?: string;      // pass a canonical URL if you have a per-deal route; otherwise omit
  className?: string;
  variant?: "link" | "pill";
  withIcon?: boolean;
  children?: React.ReactNode; // optional custom label/icon
};

export default function ShareButton({
  title,
  text,
  url,
  className,
  variant = "link",
  withIcon = true,
  children,
}: Props) {
  const onClick = async () => {
    const shareUrl = buildShareUrl(url);
    const payload: SharePayload = {
      title: title ?? "DealTown",
      text: text ?? "Check out this deal on DealTown",
      url: shareUrl,
    };
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share(payload as ShareData);
        return;
      }
      await copyToClipboard(shareUrl);
      alert("Link copied to clipboard");
    } catch {
      // user cancelled share or clipboard failed
    }
  };

  const pillClasses =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium " +
    "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 " +
    "transition shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 " +
    "active:translate-y-px";

  const linkClasses =
    "text-sm underline underline-offset-4 hover:opacity-80 focus:outline-none";

  return (
    <button
      type="button"
      onClick={onClick}
      className={className ?? (variant === "pill" ? pillClasses : linkClasses)}
      aria-label="Share this deal"
    >
      {withIcon && variant === "pill" ? <Share2 size={14} /> : null}
      {children ?? "Share"}
    </button>
  );
}

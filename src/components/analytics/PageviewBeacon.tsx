"use client";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { logEvent } from "@/lib/analytics";

export default function PageviewBeacon() {
  const pathname = usePathname();
  const search = useSearchParams();
  const last = useRef<string>("");
  const hasSent = useRef(false);

  useEffect(() => {
    const p = pathname + (search?.toString() ? `?${search}` : "");
    
    // Track navigation changes: if pathname changed, send and reset hasSent
    if (last.current !== p) {
      last.current = p;
      hasSent.current = false; // Reset to allow sending for new pathname
    }
    
    // Prevent duplicate calls in Strict Mode: only send once per pathname per mount
    if (hasSent.current) return;
    
    hasSent.current = true;

    logEvent({
      type: "pageview",
      category: "navigation",
      action: "pageview",
    });
  }, [pathname, search]);

  return null;
}
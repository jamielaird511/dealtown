"use client";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { logEvent } from "@/lib/analytics";

export default function PageviewBeacon() {
  const pathname = usePathname();
  const search = useSearchParams();
  const last = useRef<string>("");

  useEffect(() => {
    const p = pathname + (search?.toString() ? `?${search}` : "");
    if (last.current === p) return;
    last.current = p;

    logEvent({
      type: "pageview",
      category: "navigation",
      action: "pageview",
    });
  }, [pathname, search]);

  return null;
}
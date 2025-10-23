import { getSessionId } from "@/lib/client/session";
import { getCampaign } from "@/lib/client/campaign";

export type AnalyticsEvent = {
  type?: string; // legacy support
  category: "engagement" | "navigation" | "admin" | "error";
  action: "click" | "share" | "pageview" | "impression" | "submit";
  label?: string;
  value?: number;
  session_id?: string;
  campaign?: Record<string, string>;
  // Additional context
  entity_type?: "deal" | "happy_hour" | "lunch";
  entity_id?: string | number;
  method?: string;
  target_url?: string;
  context?: string;
  title?: string;
};

export async function logEvent(body: AnalyticsEvent) {
  try {
    const sessionId = getSessionId();
    const campaign = getCampaign();
    
    const payload = {
      ...body,
      session_id: sessionId,
      campaign: Object.keys(campaign).length > 0 ? campaign : undefined,
    };

    const url = "/api/track-click";
    const json = JSON.stringify(payload);
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([json], { type: "application/json" });
      (navigator as any).sendBeacon(url, blob);
      return;
    }
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: json, keepalive: true });
  } catch { /* swallow */ }
}

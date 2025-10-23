// tiny client helper for all events
export function getSessionId(): string | undefined {
  try {
    const k = "dt_sid";
    let v = localStorage.getItem(k);
    if (!v) { v = crypto.randomUUID(); localStorage.setItem(k, v); }
    return v;
  } catch {
    return undefined;
  }
}

export async function logEvent(payload: Record<string, unknown>) {
  const enrichedPayload = {
    session_id: getSessionId(),
    path: typeof window !== "undefined" ? window.location.pathname + window.location.search : null,
    ...payload,
  };

  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.debug("[analytics] track-click payload →", enrichedPayload);
  }

  const url =
    "/api/track-click" + (process.env.NODE_ENV !== "production" ? "?debug=1" : "");

  const body = new Blob([JSON.stringify(enrichedPayload)], {
    type: "application/json",
  });

  let ok = false;
  if (navigator.sendBeacon) {
    ok = navigator.sendBeacon(url, body);
  }

  if (!ok) {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enrichedPayload),
        keepalive: true,
      });
    } catch {
      // swallow — analytics must never block
    }
  }
}

// src/app/api/track-click/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const h = headers();
  try {
    const payload = await req.json();

    // Debug: what did we actually receive?
    console.log("[track-click] payload →", payload);

    const vercelCountry = h.get("x-vercel-ip-country");
    const vercelCity = h.get("x-vercel-ip-city");
    const vercelRegion = h.get("x-vercel-ip-region");
    const isProd = process.env.NODE_ENV === "production";
    const country = vercelCountry ?? (isProd ? null : "NZ");
    const city    = vercelCity    ?? (isProd ? null : "Queenstown");
    const region  = vercelRegion  ?? (isProd ? null : "OTA");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from("click_events").insert({
      // core types
      type: payload?.type ?? "address",
      category: payload?.category ?? null,
      action: payload?.action ?? null,
      label: payload?.label ?? null,
      value: payload?.value ?? null,

      // context
      session_id: payload?.session_id ?? null,
      path: payload?.path ?? null,
      entity_type: payload?.entity_type ?? null,
      entity_id: payload?.entity_id ?? null,
      venue_id: payload?.venue_id ?? null,
      method: payload?.method ?? null,
      target_url: payload?.target_url ?? null,
      context: payload?.context ?? null,

      // geo
      country, city, region,

      // request metadata
      user_agent: h.get("user-agent"),
      referer: h.get("referer"),
      ip: h.get("x-forwarded-for"),
    });

    if (error) {
      console.error("[track-click] insert error →", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[track-click] handler error →", e);
    // Still return 200 so clicks never block UX
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

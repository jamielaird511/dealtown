import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const h = headers();
    
    // TEMP: log what prod actually receives (remove after verifying)
    console.log("[track-click] payload", payload);
    console.log("[track-click] geo", {
      country: h.get("x-vercel-ip-country"),
      city:    h.get("x-vercel-ip-city"),
      region:  h.get("x-vercel-ip-region"),
    });
    
    // Geo (Vercel provides these in production; add a dev fallback)
    const vercelCountry = h.get("x-vercel-ip-country");
    const vercelCity = h.get("x-vercel-ip-city");
    const vercelRegion = h.get("x-vercel-ip-region");
    const isProd = process.env.NODE_ENV === "production";
    const country = vercelCountry ?? (isProd ? null : "NZ");
    const city    = vercelCity    ?? (isProd ? null : "Queenstown");
    const region  = vercelRegion  ?? (isProd ? null : "OTA");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // server only
    );

    await supabase.from("click_events").insert({
      type: payload?.type ?? "address",
      session_id: payload?.session_id ?? null,
      path: payload?.path ?? null,
      entity_type: payload?.entity_type ?? null,
      entity_id: payload?.entity_id ?? null,
      venue_id: payload?.venue_id ?? null,
      method: payload?.method ?? null,
      target_url: payload?.target_url ?? null,
      context: payload?.context ?? null,
      // geo fields
      country,
      city,
      region,
      user_agent: h.get("user-agent"),
      referer: h.get("referer"),
      ip: h.get("x-forwarded-for"),
      // optional richer fields if you added them in your migration
      category: payload?.category ?? null,
      action: payload?.action ?? null,
      label: payload?.label ?? null,
      value: payload?.value ?? null,
      utm_source: payload?.utm_source ?? null,
      utm_medium: payload?.utm_medium ?? null,
      utm_campaign: payload?.utm_campaign ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 }); // never 500 on click
  }
}

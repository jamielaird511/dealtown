import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const h = headers();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // server only
    );
    await supabase.from("click_events").insert({
      type: payload?.type ?? "address",
      venue_id: payload?.venue_id ?? null,
      target_url: payload?.target_url ?? null,
      context: payload?.context ?? null,
      user_agent: h.get("user-agent"),
      referer: h.get("referer"),
      ip: h.get("x-forwarded-for"),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 }); // never 500 on click
  }
}

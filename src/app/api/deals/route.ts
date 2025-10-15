// src/app/api/deals/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("deals_with_venue")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);

    if (error) {
      console.error("GET /api/deals error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // IMPORTANT: return raw rows; let the frontend do day filtering (pre-change behavior)
    return NextResponse.json(data ?? [], { status: 200 });
  } catch (err: any) {
    console.error("GET /api/deals fatal:", err);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

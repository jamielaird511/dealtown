import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

// Convert dollars to cents
function toCents(raw: unknown): number | null {
  if (raw == null || String(raw).trim() === "") return null;
  const dollars = parseFloat(String(raw).replace(/[^0-9.]/g, ""));
  if (Number.isNaN(dollars)) return null;
  return Math.round(dollars * 100);
}

// Simple rate limit
const buckets = new Map<string, { last: number; tokens: number }>();
function rateOk(ip: string, cap = 10, refillMs = 6_000) {
  const now = Date.now();
  const b = buckets.get(ip) ?? { last: now, tokens: cap };
  const delta = now - b.last;
  if (delta > refillMs) b.tokens = Math.min(cap, b.tokens + Math.floor(delta / refillMs));
  b.last = now;
  if (b.tokens <= 0) return false;
  b.tokens -= 1;
  buckets.set(ip, b);
  return true;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateOk(ip)) return NextResponse.json({ error: "Slow down" }, { status: 429 });

  const { supabase } = await requireAdmin();
  const form = await req.formData();

  const title = String(form.get("title") || "").trim();
  const day_of_week = String(form.get("day_of_week") || "").toLowerCase();
  const is_active = form.get("is_active") === "on" || form.get("is_active") === "true";
  const priceRaw = form.get("price") ?? form.get("price_cents"); // accept either field name
  const price_cents = toCents(priceRaw);
  const notesRaw = form.get("notes") as string | null;
  const cleanNotes = (notesRaw ?? "").toString().trim() || null;

  const venue_id = Number(form.get("venue_id"));
  if (!venue_id || Number.isNaN(venue_id)) {
    const url = new URL("/admin/new", req.url);
    url.searchParams.set("error", "venue_id is required");
    return NextResponse.redirect(url, { status: 303 });
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[create deal] payload notes =", cleanNotes);
  }

  const { error } = await supabase
    .from("deals")
    .insert([{ title, day_of_week, is_active, price_cents, notes: cleanNotes, venue_id }]);

  if (error) {
    const url = new URL("/admin/new", req.url);
    url.searchParams.set("error", error.message);
    return NextResponse.redirect(url, { status: 303 });
  }

  const url = new URL("/admin", req.url);
  url.searchParams.set("ok", "1");
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(req: Request) {
  const { supabase } = await requireAdmin();

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const day = url.searchParams.get("day");
  const limit = Number(url.searchParams.get("limit")) || 50;
  const offset = Number(url.searchParams.get("offset")) || 0;

  // Support ?id= for single deal fetch
  if (id) {
    const { data, error } = await supabase
      .from("deals")
      .select(
        `
        *,
        venue:venues!deals_venue_id_fkey (*)
      `
      )
      .eq("id", Number(id))
      .maybeSingle();
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, data: data ? [data] : [] });
  }

  let query = supabase
    .from("deals")
    .select(
      `
      *,
      venue:venues!deals_venue_id_fkey (*)
    `,
      { count: "exact" }
    )
    .order("price_cents", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (day) query = query.eq("day_of_week", day);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, data, count });
}

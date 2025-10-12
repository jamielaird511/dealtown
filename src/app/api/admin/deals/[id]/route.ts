import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

// Convert "28.00" => 2800, "", null => null
function toCents(raw: unknown): number | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const dollars = parseFloat(s.replace(/[^0-9.]/g, ""));
  return Number.isFinite(dollars) ? Math.round(dollars * 100) : null;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { supabase } = await requireAdmin();

    // Read the body ONCE
    const contentType = req.headers.get("content-type") || "";
    const fields: Record<string, any> = {};

    if (contentType.includes("application/json")) {
      Object.assign(fields, await req.json());
    } else {
      const fd = await req.formData();
      fd.forEach((v, k) => (fields[k] = v));
    }

    // Pull fields
    const title = (fields.title ?? "").toString().trim();
    const day_of_week = (fields.day_of_week ?? "").toString().toLowerCase() || null;
    const is_active = ["on", "true", "1", "yes"].includes(
      String(fields.is_active ?? "true").toLowerCase()
    );
    const price_cents = toCents(fields.price ?? fields.price_cents);
    const notes = fields.notes ? String(fields.notes).trim() || null : null;

    // Get venue_id from form
    let venue_id = fields.venue_id ? Number(fields.venue_id) : null;

    if (!venue_id || Number.isNaN(venue_id)) {
      const url = new URL(`/admin/${params.id}`, req.url);
      url.searchParams.set("error", "venue_id is required");
      return NextResponse.redirect(url, { status: 303 });
    }

    // Update the deal
    const { error: updErr } = await supabase
      .from("deals")
      .update({ title, day_of_week, is_active, price_cents, notes, venue_id })
      .eq("id", Number(params.id));

    if (updErr) {
      const url = new URL(`/admin/${params.id}`, req.url);
      url.searchParams.set("error", updErr.message);
      return NextResponse.redirect(url, { status: 303 });
    }

    return NextResponse.redirect(new URL("/admin/deals?ok=1", req.url), { status: 303 });
  } catch (e: any) {
    console.error("PATCH /api/admin/deals/[id] failed:", e);
    const url = new URL(`/admin/${params.id}`, req.url);
    url.searchParams.set("error", e?.message ?? "Internal error");
    return NextResponse.redirect(url, { status: 303 });
  }
}

// Support HTML forms with _method=PATCH or _action=delete
export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const { supabase } = await requireAdmin();

    // Read body once
    const contentType = req.headers.get("content-type") || "";
    const fields: Record<string, any> = {};

    if (contentType.includes("application/json")) {
      Object.assign(fields, await req.json());
    } else {
      const fd = await req.formData();
      fd.forEach((v, k) => (fields[k] = v));
    }

    const methodOverride = (fields._method ?? "").toString().toUpperCase();
    const action = (fields._action ?? "").toString();

    // Handle DELETE
    if (action === "delete" || methodOverride === "DELETE") {
      const { error } = await supabase.from("deals").delete().eq("id", Number(ctx.params.id));

      if (error) {
        const url = new URL("/admin", req.url);
        url.searchParams.set("error", error.message);
        return NextResponse.redirect(url, { status: 303 });
      }

      const url = new URL("/admin", req.url);
      url.searchParams.set("ok", "1");
      return NextResponse.redirect(url, { status: 303 });
    }

    // Handle PATCH (default for form posts)
    const title = (fields.title ?? "").toString().trim();
    const day_of_week = (fields.day_of_week ?? "").toString().toLowerCase() || null;
    const is_active = ["on", "true", "1", "yes"].includes(
      String(fields.is_active ?? "true").toLowerCase()
    );
    const price_cents = toCents(fields.price ?? fields.price_cents);
    const notes = fields.notes ? String(fields.notes).trim() || null : null;

    let venue_id = fields.venue_id ? Number(fields.venue_id) : null;

    if (!venue_id || Number.isNaN(venue_id)) {
      const url = new URL(`/admin/${ctx.params.id}`, req.url);
      url.searchParams.set("error", "venue_id is required");
      return NextResponse.redirect(url, { status: 303 });
    }

    const { error: updErr } = await supabase
      .from("deals")
      .update({ title, day_of_week, is_active, price_cents, notes, venue_id })
      .eq("id", Number(ctx.params.id));

    if (updErr) {
      const url = new URL(`/admin/${ctx.params.id}`, req.url);
      url.searchParams.set("error", updErr.message);
      return NextResponse.redirect(url, { status: 303 });
    }

    return NextResponse.redirect(new URL("/admin/deals?ok=1", req.url), { status: 303 });
  } catch (e: any) {
    console.error("POST /api/admin/deals/[id] failed:", e);
    const url = new URL(`/admin/${ctx.params.id}`, req.url);
    url.searchParams.set("error", e?.message ?? "Internal error");
    return NextResponse.redirect(url, { status: 303 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("deals").delete().eq("id", Number(params.id));

    if (error) {
      const url = new URL("/admin", req.url);
      url.searchParams.set("error", error.message);
      return NextResponse.redirect(url, { status: 303 });
    }

    const url = new URL("/admin", req.url);
    url.searchParams.set("ok", "1");
    return NextResponse.redirect(url, { status: 303 });
  } catch (e: any) {
    console.error("DELETE /api/admin/deals/[id] failed:", e);
    const url = new URL("/admin", req.url);
    url.searchParams.set("error", e?.message ?? "Internal error");
    return NextResponse.redirect(url, { status: 303 });
  }
}

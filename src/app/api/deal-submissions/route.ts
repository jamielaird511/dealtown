import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSubmissionEmailHTTP } from "@/lib/email";

type Incoming = {
  venue_name?: string;
  deal_title?: string;
  description?: string | null;
  days?: string[];
  start_time?: string | null;
  end_time?: string | null;
  submitter_email?: string | null;
  category?: string | null;
};

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // server-only
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Incoming;
    const venue_name = (body.venue_name ?? "").trim();
    const deal_title = (body.deal_title ?? "").trim();
    const description = (body.description ?? "")?.trim() || null;
    const days = Array.isArray(body.days) ? body.days.map(String) : [];
    const start_time = body.start_time || null;
    const end_time = body.end_time || null;
    const submitter_email = body.submitter_email || null;
    const category = body.category || null;

    if (!venue_name || !deal_title || days.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: venue_name, deal_title, days" },
        { status: 400 }
      );
    }


    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("deal_submissions")
      .insert([
        {
          venue_name,
          deal_title,
          title: deal_title,  // table has NOT NULL "title"
          description,
          days,
          start_time,
          end_time,
          submitter_email,
          category,
          status: "pending_review",
        },
      ])
      .select("id, venue_name, deal_title, title, description, days, start_time, end_time, submitter_email")
      .single();

    if (error) {
      console.error("Supabase insert error (deal_submissions)", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // fire-and-forget email
    try {
      await sendSubmissionEmailHTTP({
        id: data?.id ?? null,
        venue_name,
        deal_title,
        description,
        days,
        start_time,
        end_time,
        submitter_email,
        category,
      });
    } catch (e) {
      console.warn("[email] submission notice failed:", e);
    }

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (err: any) {
    console.error("POST /api/deal-submissions error", err);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

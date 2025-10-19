import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = supabaseAdmin();

    // Try to insert into lunch_specials table first, fallback to deals with category
    const lunchSpecialData = {
      venue_name: body.venue_name,
      banner_title: body.banner_title,
      price_from_cents: body.price_from_cents,
      weekdays: body.weekdays,
      days: body.days,
      start_time: body.start_time,
      end_time: body.end_time,
      tagline: body.tagline,
      notes: body.notes,
      website_url: body.website_url,
      submitter_email: body.submitter_email,
      is_approved: body.is_approved ?? false,
      created_at: new Date().toISOString(),
    };

    let result;
    let error;

    // Try lunch_specials table first
    try {
      const { data, error: insertError } = await supabase
        .from("lunch_specials")
        .insert([lunchSpecialData])
        .select("id")
        .single();
      
      result = data;
      error = insertError;
    } catch (e) {
      // Fallback to deals table with category
      const dealData = {
        venue_name: body.venue_name,
        title: body.banner_title,
        description: body.notes,
        price_cents: body.price_from_cents,
        days: body.days,
        start_time: body.start_time,
        end_time: body.end_time,
        website_url: body.website_url,
        category: "lunch",
        submitter_email: body.submitter_email,
        is_approved: body.is_approved ?? false,
        created_at: new Date().toISOString(),
      };

      const { data, error: insertError } = await supabase
        .from("deals")
        .insert([dealData])
        .select("id")
        .single();
      
      result = data;
      error = insertError;
    }

    if (error) {
      console.error("Error inserting lunch special:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: result?.id });
  } catch (err: any) {
    console.error("POST /api/lunch-specials error:", err);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

// src/app/api/deals/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const d = (url.searchParams.get("day") ?? "today").toLowerCase();

  if (d === "today") {
    const { data, error } = await supabase
      .from("today_active_deals")
      .select("id,title")
      .order("id");
    return NextResponse.json({ mode: "view:today_active_deals", day: d, error, count: data?.length ?? 0, rows: data ?? [] });
  }

  const { data, error } = await supabase
    .from("deals")
    .select("id,title,day_of_week,is_active")
    .eq("is_active", true)
    .eq("day_of_week", d)
    .order("id");
  return NextResponse.json({ mode: "table:deals", day: d, error, count: data?.length ?? 0, rows: data ?? [] });
}

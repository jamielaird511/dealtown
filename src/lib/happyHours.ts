import { supabaseAdmin } from "@/lib/supabase/admin";

const DOW = () => new Date().getDay(); // 0..6

export async function listHappyHoursForDay(dayIndex = DOW()) {
  const supabase = supabaseAdmin;
  return supabase
    .from("happy_hours")
    .select(`
      id, venue_id, title, details, price_cents, start_time, end_time, days, website_url,
      venues:venues!happy_hours_venue_id_fkey ( id, name, address )
    `)
    .contains("days", [dayIndex])
    .eq("is_active", true)
    .order("start_time", { ascending: true });
}

export async function createHappyHour(payload: any) {
  const supabase = supabaseAdmin;
  return supabase.from("happy_hours").insert(payload).select().single();
}

export async function updateHappyHour(id: string, payload: any) {
  const supabase = supabaseAdmin;
  return supabase.from("happy_hours").update(payload).eq("id", id).select().single();
}

export async function deleteHappyHour(id: string) {
  const supabase = supabaseAdmin;
  return supabase.from("happy_hours").delete().eq("id", id);
}


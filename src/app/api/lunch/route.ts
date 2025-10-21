import { NextResponse } from 'next/server';
import { getSupabaseServerActionClient } from '@/lib/supabaseClients';

export async function POST(req: Request) {
  const supabase = getSupabaseServerActionClient();
  const raw = await req.json().catch(() => ({}));

  // days_of_week may arrive as single value or array of strings
  const toDays = (val: any): number[] | null => {
    if (val == null) return null;
    const arr = Array.isArray(val) ? val : (String(val) ? [val] : []);
    const nums = arr.map((v:any)=>Number(v)).filter((n:number)=>Number.isFinite(n) && n>=0 && n<=6);
    return nums.length ? nums : null;
  };

  const payload = {
    title: String(raw.title ?? '').trim(),
    venue_id: raw.venue_id != null ? Number(raw.venue_id) : null,
    description: raw.description ?? null,
    price: raw.price != null && raw.price !== '' ? Number(raw.price) : null,
    is_active: raw.is_active === true || raw.is_active === 'on' || raw.is_active === 'true',
    days_of_week: toDays(raw['days_of_week[]'] ?? raw.days_of_week),
    start_time: raw.start_time ? String(raw.start_time) : null,
    end_time:   raw.end_time ? String(raw.end_time) : null,
  };

  if (!payload.title || !payload.venue_id) {
    return NextResponse.json({ error: 'title and venue_id are required' }, { status: 400 });
  }

  const { data, error } = await supabase.from('lunch_menus').insert(payload).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data?.id });
}

import { NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabaseClients';

export async function POST(req: Request) {
  const supabase = getSupabaseServiceRoleClient();
  const body = await req.json();

  const insert = {
    venue_id: body.venue_id ?? null,
    title: body.title ?? null,
    description: body.description ?? null,
    start_time: body.start_time ?? null,
    end_time: body.end_time ?? null,
    price_cents: body.price_cents ?? null,
    days: Array.isArray(body.days) ? body.days : [],     // <--
    is_active: body.is_active ?? true,
  };

  const { data, error } = await supabase
    .from('lunch_menus')
    .insert(insert)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, data }, { status: 201 });
}
import { NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabaseClients';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServiceRoleClient();
  const body = await req.json();

  const update = {
    venue_id: body.venue_id ?? null,
    title: body.title ?? null,
    description: body.description ?? null,
    start_time: body.start_time ?? null,
    end_time: body.end_time ?? null,
    price_cents: body.price_cents ?? null,
    days: Array.isArray(body.days) ? body.days : null,  // <--
    is_active: body.is_active ?? true,
  };

  const { data, error } = await supabase
    .from('lunch_menus')
    .update(update)
    .eq('id', params.id)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, data });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServiceRoleClient();

  const { error } = await supabase
    .from('lunch_menus')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
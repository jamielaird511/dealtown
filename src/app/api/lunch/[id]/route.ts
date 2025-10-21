import { NextResponse } from 'next/server';
import { getSupabaseServerActionClient } from '@/lib/supabaseClients';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerActionClient();
  const form = await req.formData();
  const method = String(form.get('_method') ?? 'PATCH').toUpperCase();

  const toDays = (vals: FormDataEntryValue[] | null): number[] | null => {
    if (!vals) return null;
    const arr = Array.isArray(vals) ? vals : [vals];
    const nums = arr.map((v:any)=>Number(v)).filter((n:number)=>Number.isFinite(n) && n>=0 && n<=6);
    return nums.length ? nums : null;
  };

  if (method === 'PATCH') {
    const payload = {
      title: String(form.get('title') ?? '').trim(),
      venue_id: form.get('venue_id') != null ? Number(form.get('venue_id')) : null,
      description: (form.get('description') as string) ?? null,
      price: form.get('price') ? Number(form.get('price')) : null,
      is_active: form.get('is_active') ? true : false,
      days_of_week: toDays(form.getAll('days_of_week[]')),
      start_time: form.get('start_time') ? String(form.get('start_time')) : null,
      end_time:   form.get('end_time') ? String(form.get('end_time')) : null,
    };
    if (!payload.title || !payload.venue_id) {
      return NextResponse.json({ error: 'title and venue_id are required' }, { status: 400 });
    }
    const { error } = await supabase.from('lunch_menus').update(payload).eq('id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.redirect(new URL('/admin/lunch', req.url));
  }

  if (method === 'DELETE') {
    const { error } = await supabase.from('lunch_menus').delete().eq('id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.redirect(new URL('/admin/lunch', req.url));
  }

  return NextResponse.json({ error: 'Unsupported method' }, { status: 405 });
}

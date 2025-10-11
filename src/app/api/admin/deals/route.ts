import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { centsFromMoney } from '@/lib/money';

const dayEnum = z.enum(['monday','tuesday','wednesday','thursday','friday','saturday','sunday']);

const createDealSchema = z.object({
  title: z.string().min(2),
  day_of_week: dayEnum,
  is_active: z.boolean().default(true),
  venue_name: z.string().min(2),
  venue_address: z.string().min(2),
  website_url: z.string().url().optional().or(z.literal('')).transform(v => v || null),
  notes: z.string().max(1000).optional().or(z.literal('')).transform(v => v || null),
  price: z.string().optional(),
  price_cents: z.number().int().nullable().optional(),
}).transform((v) => ({
  ...v,
  price_cents: v.price_cents ?? centsFromMoney(v.price),
}));

const qSchema = z.object({
  day: z.string().optional(),
  q: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

// Simple rate limit
const buckets = new Map<string, { last:number; tokens:number }>();
function rateOk(ip: string, cap=10, refillMs=6_000) {
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

export async function GET(req: Request) {
  const { supabase } = await requireAdmin();

  const url = new URL(req.url);
  const parsed = qSchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'Invalid params' }, { status: 400 });

  const { day, q, limit = 50, offset = 0 } = parsed.data;

  let query = supabase.from('deals')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (day) query = query.eq('day_of_week', day);
  if (q) query = query.or(`title.ilike.%${q}%,venue_name.ilike.%${q}%`);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, data, count });
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!rateOk(ip)) return NextResponse.json({ ok: false, message: 'Slow down' }, { status: 429 });

  const { supabase, user } = await requireAdmin();

  const body = await req.json();
  const parsed = createDealSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'Invalid input', errors: parsed.error.flatten() }, { status: 400 });

  const { data, error } = await supabase.from('deals')
    .insert({ ...parsed.data, created_by: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, data });
}

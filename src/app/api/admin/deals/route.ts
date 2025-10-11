import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { centsFromMoney } from '@/lib/money';

const dayEnum = z.enum(['monday','tuesday','wednesday','thursday','friday','saturday','sunday']);

const kindEnum = z.enum(['fixed', 'percent_off', 'amount_off', 'bogo']);

const createDealSchema = z.object({
  title: z.string().min(2),
  day_of_week: dayEnum,
  is_active: z.boolean().default(true),
  venue_name: z.string().min(2),
  venue_address: z.string().min(2),
  website_url: z.string().url().optional().or(z.literal('')).transform(v => v || null),
  notes: z.string().max(1000).optional().or(z.literal('')).transform(v => v || null),
  kind: kindEnum.default('fixed'),
  price: z.string().optional(),
  percent_off: z.coerce.number().int().min(1).max(100).optional(),
  amount_off: z.string().optional(),
  buy_qty: z.coerce.number().int().min(1).optional(),
  get_qty: z.coerce.number().int().min(1).optional(),
}).transform((v) => {
  const { price, amount_off, ...rest } = v;
  return {
    ...rest,
    price_cents: centsFromMoney(price),
    amount_off_cents: centsFromMoney(amount_off),
  };
}).superRefine((data, ctx) => {
  if (data.kind === 'fixed' && !data.price_cents) {
    ctx.addIssue({ path: ['price'], code: 'custom', message: 'Price required for fixed deals' });
  }
  if (data.kind === 'percent_off' && !data.percent_off) {
    ctx.addIssue({ path: ['percent_off'], code: 'custom', message: 'Percent off required' });
  }
  if (data.kind === 'amount_off' && !data.amount_off_cents) {
    ctx.addIssue({ path: ['amount_off'], code: 'custom', message: 'Amount off required' });
  }
  if (data.kind === 'bogo' && (!data.buy_qty || !data.get_qty)) {
    ctx.addIssue({ path: ['buy_qty'], code: 'custom', message: 'Buy and get quantities required' });
  }
});

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
  
  // Support ?id= for single deal fetch
  const id = url.searchParams.get('id');
  if (id) {
    const { data, error } = await supabase.from('deals')
      .select('*')
      .eq('id', Number(id))
      .maybeSingle();
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, data: data ? [data] : [] });
  }

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

async function parseBody(req: Request) {
  const ct = req.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return req.json();
  const fd = await req.formData();
  return Object.fromEntries(fd.entries());
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!rateOk(ip)) return NextResponse.json({ ok: false, message: 'Slow down' }, { status: 429 });

  const { supabase, user } = await requireAdmin();

  const body = await parseBody(req);
  
  // Coerce checkbox
  const rawData = {
    ...body,
    is_active: typeof body.is_active === 'string' ? body.is_active === 'on' : !!body.is_active,
  };

  const parsed = createDealSchema.safeParse(rawData);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? 'Invalid input';
    const url = new URL('/admin/new', req.url);
    url.searchParams.set('error', msg);
    return NextResponse.redirect(url, { status: 303 });
  }

  // Clean up: set null for unused fields based on kind
  const cleanData = { ...parsed.data, created_by: user.id };
  if (cleanData.kind === 'fixed') {
    cleanData.percent_off = null;
    cleanData.amount_off_cents = null;
    cleanData.buy_qty = null;
    cleanData.get_qty = null;
  } else if (cleanData.kind === 'percent_off') {
    cleanData.amount_off_cents = null;
    cleanData.buy_qty = null;
    cleanData.get_qty = null;
  } else if (cleanData.kind === 'amount_off') {
    cleanData.percent_off = null;
    cleanData.buy_qty = null;
    cleanData.get_qty = null;
  } else if (cleanData.kind === 'bogo') {
    cleanData.percent_off = null;
    cleanData.amount_off_cents = null;
  }

  const { error } = await supabase.from('deals').insert(cleanData);

  if (error) {
    const url = new URL('/admin/new', req.url);
    url.searchParams.set('error', error.message);
    return NextResponse.redirect(url, { status: 303 });
  }

  const url = new URL('/admin', req.url);
  url.searchParams.set('ok', '1');
  return NextResponse.redirect(url, { status: 303 });
}

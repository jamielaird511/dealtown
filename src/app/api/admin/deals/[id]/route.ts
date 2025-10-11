import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { z, ZodError } from 'zod';

function sb() {
  const store = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(n) { return store.get(n)?.value; },
        set(n, v, o) { store.set(n, v, o); },
        remove(n, o) { store.set(n, '', { ...o, maxAge: 0 }); },
      },
    }
  );
}

/** Parse body ONCE. Supports JSON & FormData. */
async function readBody(req: Request) {
  const ct = req.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    const json = await req.json();
    // unify access: body.get(name)
    return {
      type: 'json' as const,
      raw: json as Record<string, any>,
      get: (k: string) => (json as any)?.[k],
      entries: () => Object.entries(json ?? {}),
    };
  }
  const form = await req.formData();
  return {
    type: 'form' as const,
    raw: form,
    get: (k: string) => form.get(k),
    entries: () => Array.from(form.entries()),
  };
}

const dayEnum = z.enum([
  'monday','tuesday','wednesday','thursday','friday','saturday','sunday'
]);

const editSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  day_of_week: dayEnum,
  venue_name: z.string().trim().min(1, 'Venue name is required'),
  venue_address: z.string().trim().min(1, 'Venue address is required'),
  website_url: z.string().trim().url('Website must be a valid URL').optional().or(z.literal('')),
  notes: z.string().trim().optional(),
  price: z.string().trim().optional(),
  is_active: z.union([z.boolean(), z.string()]).optional(),
});

function priceToCentsMaybe(s?: string) {
  if (s == null) return undefined;
  const n = Number(String(s).replace(/[^\d.]/g, ''));
  if (Number.isNaN(n)) return undefined;
  return Math.round(n * 100);
}

function backToEdit(req: Request, id: string | number, msg?: string) {
  const url = new URL(`/admin/${id}`, req.url);
  if (msg) url.searchParams.set('error', msg);
  return NextResponse.redirect(url, { status: 303 });
}
function backToList(req: Request, msg?: string) {
  const url = new URL('/admin', req.url);
  if (msg) url.searchParams.set('error', msg);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  // Some forms use POST + hidden _method=PATCH or _action=delete
  return PATCH(req, ctx);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const admin = sb();

  // ✅ Read body ONCE
  const body = await readBody(req);

  // Determine method/action without reading again
  const methodOverride = String(body.get('_method') ?? '').toUpperCase();
  const action = String(body.get('_action') ?? '');

  if (action === 'delete' || methodOverride === 'DELETE') {
    try {
      const { error } = await admin.from('deals').delete().eq('id', id);
      if (error) return backToList(req, error.message);
      return backToList(req);
    } catch (e: any) {
      console.error('DELETE failed:', e);
      return backToList(req, 'Unexpected error while deleting');
    }
  }

  // Build a plain object from body once
  const raw: Record<string, any> =
    body.type === 'form'
      ? Object.fromEntries(body.entries())
      : (body.raw as Record<string, any>);

  // Coerce checkbox and blanks
  if (typeof raw.is_active === 'string') {
    raw.is_active = ['on', 'true', '1', 'yes'].includes(raw.is_active.toLowerCase());
  }
  // Allow blank URL to mean "no URL"
  if (raw.website_url === '') raw.website_url = undefined;

  try {
    const parsed = editSchema.parse({
      title: raw.title,
      day_of_week: raw.day_of_week,
      venue_name: raw.venue_name,
      venue_address: raw.venue_address,
      website_url: raw.website_url,
      notes: raw.notes,
      price: raw.price,
      is_active: raw.is_active,
    });

    const payload: Record<string, any> = {
      title: parsed.title,
      day_of_week: parsed.day_of_week,
      venue_name: parsed.venue_name,
      venue_address: parsed.venue_address,
      updated_at: new Date().toISOString(),
    };

    // Only set optional fields if present (don't violate NOT NULL cols)
    if ('website_url' in raw) payload.website_url = parsed.website_url ?? null;
    if ('notes' in raw) payload.notes = parsed.notes ?? null;
    if ('price' in raw) {
      const cents = priceToCentsMaybe(parsed.price);
      if (cents !== undefined) payload.price_cents = cents;
    }
    if ('is_active' in raw) payload.is_active = !!parsed.is_active;

    const { error } = await admin.from('deals').update(payload).eq('id', id);
    if (error) return backToEdit(req, id, error.message);

    return backToList(req);
  } catch (err) {
    if (err instanceof ZodError) {
      return backToEdit(req, id, err.errors[0]?.message ?? 'Validation error');
    }
    console.error('PATCH failed:', err);
    return backToEdit(req, id, 'Unexpected error while saving');
  }
}

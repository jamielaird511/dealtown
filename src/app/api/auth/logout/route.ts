import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (k) => cookieStore.get(k)?.value, set: (k, v, o) => cookieStore.set(k, v, o), remove: (k, o) => cookieStore.set(k, '', { ...o, maxAge: 0 }) } }
  );
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}


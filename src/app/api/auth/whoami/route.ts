import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET() {
  const store = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => store.get(n)?.value,
        set: (n, v, o) => { store.set(n, v, o); },
        remove: (n, o) => { store.set(n, '', { ...o, maxAge: 0 }); },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return NextResponse.json({
    hasAuthCookie: store.getAll().length > 0,
    userId: user?.id ?? null,
    email: user?.email ?? null,
  });
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
        set: (n, v, o) => cookieStore.set(n, v, o),
        remove: (n, o) => cookieStore.set(n, '', { ...o, maxAge: 0 }),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return NextResponse.json({
    hasAuthCookie: !!cookieStore.getAll().find(c => c.name.startsWith('sb-')),
    userId: user?.id ?? null,
    email: user?.email ?? null,
  });
}


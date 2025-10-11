// src/lib/auth.ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';

export function createSupabaseServer() {
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

export async function requireAdmin() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: isAdmin, error } = await supabase.rpc('is_admin', { uid: user.id });
  if (error || !isAdmin) redirect('/login?unauthorized=1');

  return { user, supabase };
}


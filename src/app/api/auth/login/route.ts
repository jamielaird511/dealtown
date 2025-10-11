import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

function makeClient() {
  const store = cookies();
  return createServerClient(
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
}

export async function POST(req: Request) {
  let email = '', password = '';
  const ct = req.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    ({ email, password } = await req.json());
  } else {
    const form = await req.formData();
    email = String(form.get('email') ?? '');
    password = String(form.get('password') ?? '');
  }

  const supabase = makeClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const url = new URL('/login', req.url);
    url.searchParams.set('error', error.message);
    return NextResponse.redirect(url, { status: 303 });
  }

  // Cookies are set by the helper; now navigate to /admin
  return NextResponse.redirect(new URL('/admin', req.url), { status: 303 });
}

export async function GET() {
  return new Response('login endpoint OK — use POST to sign in', { status: 200 });
}

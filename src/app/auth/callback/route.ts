import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: Request) {
  const store = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => store.get(n)?.value,
        set: (n, v, o) => {
          store.set(n, v, o);
        },
        remove: (n, o) => {
          store.set(n, "", { ...o, maxAge: 0 });
        },
      },
    }
  );

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=auth", req.url), { status: 303 });
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=auth", req.url), { status: 303 });
  }

  return NextResponse.redirect(new URL("/admin", req.url), { status: 303 });
}

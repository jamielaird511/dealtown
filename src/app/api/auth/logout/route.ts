import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST() {
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
  await supabase.auth.signOut();
  return NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    { status: 303 }
  );
}

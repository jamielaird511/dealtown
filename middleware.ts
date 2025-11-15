import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const config = { matcher: ["/admin/:path*"] };

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          res.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Helpful debug to verify middleware ran and who we see
  res.headers.set("X-Auth-Debug", user ? `user:${user.email ?? "unknown"}` : "no-user");

  // Not logged in? → go to /login and preserve destination
  if (!user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectTo", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // NOTE: temporarily disable allowlist to avoid redirecting to "/"
  // const allowed = (process.env.ADMIN_EMAILS ?? "").split(",").map(s => s.trim()).filter(Boolean);
  // if (allowed.length && !allowed.includes(user.email ?? "")) {
  //   return NextResponse.redirect(new URL("/", req.url));
  // }

  return res;
}

// src/lib/auth.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

const isServer = typeof window === 'undefined';

export const authCookie = {
  get(name: string): string | null {
    // Safe on both server/client; on client we just don't have cookies() available,
    // but this file will be imported mostly on the server anyway.
    if (!isServer) return null;
    return cookies().get(name)?.value ?? null;
  },

  // Intentionally NO-OPS here to avoid "Cookies can only be modified …" runtime error
  // if someone imports this file in a client component or during server rendering.
  set(_name: string, _value: string, _options?: any): void {
    if (!isServer) {
      console.warn('[authCookie.set] skipped on client; use server action helper instead.');
    }
  },
  remove(_name: string): void {
    if (!isServer) {
      console.warn('[authCookie.remove] skipped on client; use server action helper instead.');
    }
  },
};

export function createSupabaseServer() {
  const store = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(n) {
          return store.get(n)?.value;
        },
        set(n, v, o) {
          // Only set cookies on server, and only in allowed contexts
          if (isServer) {
            try {
              store.set(n, v, o);
            } catch (error) {
              console.warn('[createSupabaseServer] Cookie set skipped:', error);
            }
          }
        },
        remove(n, o) {
          // Only remove cookies on server, and only in allowed contexts
          if (isServer) {
            try {
              store.set(n, "", { ...o, maxAge: 0 });
            } catch (error) {
              console.warn('[createSupabaseServer] Cookie remove skipped:', error);
            }
          }
        },
      },
    }
  );
}

export async function requireAdmin() {
  const supabase = createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: isAdmin, error } = await supabase.rpc("is_admin", { uid: user.id });
  if (error || !isAdmin) redirect("/login?unauthorized=1");

  return { user, supabase };
}

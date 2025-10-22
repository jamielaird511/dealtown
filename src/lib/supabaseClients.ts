import { cookies } from "next/headers";
import { createServerClient as createSupabaseServer } from "@supabase/ssr";
import { createBrowserClient } from "@supabase/ssr";
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Client for Server Components (RSC) — READ-ONLY cookie access.
 * Prevents "Cookies can only be modified..." errors during render.
 */
export function getSupabaseServerComponentClient() {
  const store = cookies();
  return createSupabaseServer(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return store.get(name)?.value;
      },
      // No-ops to avoid writes during render:
      set() {
        /* noop in RSC */
      },
      remove() {
        /* noop in RSC */
      },
    },
  });
}

/**
 * Client for Server Actions/Route Handlers — READ/WRITE cookie access.
 * Safe context to mutate cookies (refresh tokens, etc).
 */
export function getSupabaseServerActionClient() {
  const store = cookies();
  return createSupabaseServer(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return store.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        store.set(name, value, options);
      },
      remove(name: string, options: any) {
        store.set(name, "", { ...options, maxAge: 0 });
      },
    },
  });
}

/**
 * Browser client (if you need it elsewhere)
 */
export function getSupabaseBrowserClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Service role client for admin operations (bypasses RLS)
 */
export function getSupabaseServiceRoleClient() {
  return createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}


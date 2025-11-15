"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client that cooperates with @supabase/ssr middleware:
 * - Stores session in cookies so middleware can read it
 * - Works with PKCE flow by default
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Back-compat alias for existing imports:
 *   import { supabaseBrowser } from "@/lib/supabase/client";
 */
export const supabaseBrowser = createClient;

export default createClient;

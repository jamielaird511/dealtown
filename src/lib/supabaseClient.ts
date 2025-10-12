// lib/supabaseClient.ts
// Minimal browser client. Do not change unrelated code.

import { createClient } from "@supabase/supabase-js";

console.log("[supabase env]", {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 40) ?? "MISSING",
  keyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !key) {
  // Visible error helps during setup
  // eslint-disable-next-line no-console
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient(url, key);

import 'server-only';
import { createClient } from '@supabase/supabase-js';

export function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only secret
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

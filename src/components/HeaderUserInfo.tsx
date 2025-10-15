'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function HeaderUserInfo() {
  const [email, setEmail] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setEmail(data.user?.email ?? null);
    })();
    return () => { mounted = false; };
  }, [supabase]);

  if (!email) return null;

  return (
    <div className="mt-2 w-full rounded-lg bg-orange-50 text-orange-700 text-sm px-3 py-2 border border-orange-100">
      Signed in as <span className="font-medium">{email}</span>
    </div>
  );
}

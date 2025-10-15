'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <button
      onClick={handleSignOut}
      className="rounded-md bg-orange-500 px-3 py-1 text-sm text-white hover:bg-orange-600 transition-colors"
    >
      Sign out
    </button>
  );
}

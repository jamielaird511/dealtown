'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function HeaderMenu() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Load current user (to toggle admin/sign-in options)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setEmail(data.user?.email ?? null);
    })();
    return () => { mounted = false; };
  }, [supabase]);

  // Close on outside click / Esc
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    setEmail(null);
    router.replace('/');
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50"
      >
        Menu
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border bg-white shadow-lg"
        >
          <MenuItem href="/venues">Browse Venues</MenuItem>
          <MenuItem href="/fuel">Fuel</MenuItem>
          <MenuItem href="/fuel/submit">Submit Fuel Price</MenuItem>
          <div className="my-1 h-px bg-gray-100" />

          {!email ? (
            <MenuItem href="/login">Sign in</MenuItem>
          ) : (
            <>
              <MenuItem href="/admin">Admin Dashboard</MenuItem>
              <button
                role="menuitem"
                onClick={signOut}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="block px-3 py-2 text-sm hover:bg-gray-50"
    >
      {children}
    </Link>
  );
}

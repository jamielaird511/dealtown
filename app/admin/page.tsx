"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminHome() {
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setEmail(data.user?.email ?? null);
    });
    return () => { mounted = false; };
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const Card = ({ href, title, desc }: { href: string; title: string; desc: string }) => (
    <a
      href={href}
      className="rounded-2xl border p-4 hover:shadow-sm transition inline-block"
    >
      <h2 className="font-semibold">{title}</h2>
      <p className="text-sm text-slate-500">{desc}</p>
    </a>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <button
          onClick={handleSignOut}
          className="bg-orange-500 text-white px-3 py-1.5 rounded hover:bg-orange-600"
        >
          Sign out
        </button>
      </div>

      <p className="text-slate-600 mb-6">
        Signed in as <span className="font-medium">{email ?? "…"}</span>
      </p>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card href="/admin/venues" title="Venues" desc="Manage venues." />
        <Card href="/admin/deals" title="Deals" desc="Daily food & drink deals." />
        <Card href="/admin/happy-hours" title="Happy Hour" desc="Times & days for drink specials." />
        <Card href="/admin/lunch" title="Lunch Menus" desc="Add, edit, and archive lunch items." />
        <Card href="/admin/analytics" title="Analytics" desc="Clicks by venue & day." />
      </div>

      <footer className="mt-12 text-center text-sm text-slate-500">
        © 2025 DealTown • Built in Queenstown
      </footer>
    </div>
  );
}

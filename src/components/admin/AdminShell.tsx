import Link from "next/link";
import { ReactNode } from "react";

export default function AdminShell({ children }: { children: ReactNode }) {
  const nav = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/venues", label: "Venues" },
    { href: "/admin/deals", label: "Deals" },
    { href: "/admin/happy-hours", label: "Happy Hour" },
    { href: "/admin/lunch", label: "Lunch Menus" },
    { href: "/admin/analytics", label: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="text-xl font-semibold">DealTown Admin</Link>
          <nav className="flex gap-4 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="text-gray-600 hover:text-black">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}


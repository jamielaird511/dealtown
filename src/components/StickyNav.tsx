"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// If your Daily Deals lives at /deals, change href: "/" -> "/deals"
const ROUTES = [
  { href: "/",           label: "Daily Deals" },
  { href: "/lunch",      label: "Lunch Specials" },
  { href: "/happy-hour", label: "Happy Hour" },
];

export default function StickyNav() {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  // Uncomment to hide nav on admin pages:
  // if (pathname?.startsWith("/admin")) return null;

  return (
    <nav
      className="
        sticky top-0 z-50
        bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60
        border-b
      "
      aria-label="Primary"
    >
      <div
        className="
          mx-auto max-w-5xl px-3
          h-12 flex items-center
          overflow-x-auto
        "
      >
        {/* Center the button group; keep scroll on very small screens */}
        <div className="mx-auto w-max flex items-center gap-2">
          {ROUTES.map((r) => {
            const active = isActive(r.href);
            return (
              <Link
                key={r.href}
                href={r.href}
                className={[
                  "px-3 py-1.5 text-sm md:text-[0.95rem] rounded-full border transition",
                  "hover:bg-gray-50",
                  active
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-800 border-gray-300",
                ].join(" ")}
              >
                {r.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}


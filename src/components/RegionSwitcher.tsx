"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

const REGIONS = [
  { slug: "queenstown", label: "Queenstown" },
  { slug: "wanaka", label: "Wanaka" },
  { slug: "dunedin", label: "Dunedin" },
];

export default function RegionSwitcher({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (slug: string) => {
    setOpen(false);
    // always go to the region root for now
    router.push(`/${slug}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const active = REGIONS.find(r => r.slug === current) ?? REGIONS[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label={`Current city: ${active.label}`}
        className="ml-2 inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-sm ring-1 ring-orange-400/50 hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 transition sm:text-sm"
      >
        {active.label}
        <span className="text-xs opacity-80">▼</span>
      </button>
      {open ? (
        <div className="absolute mt-2 w-40 bg-white border rounded-xl shadow-md z-50">
          {REGIONS.map(region => (
            <button
              key={region.slug}
              onClick={() => handleSelect(region.slug)}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 ${
                region.slug === active.slug ? "font-semibold" : ""
              }`}
            >
              {region.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

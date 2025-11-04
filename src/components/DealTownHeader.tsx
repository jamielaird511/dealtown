"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderMenu from "@/components/HeaderMenu";
import SubmitDealModal from "@/components/SubmitDealModal";
import RegionSwitcher from "@/components/RegionSwitcher";

export default function DealTownHeader() {
  const [modalOpen, setModalOpen] = useState(false);
  const pathname = usePathname();
  // pathname like "/", "/queenstown", "/queenstown/deal/123"
  const parts = pathname.split("/").filter(Boolean);
  const currentRegion = parts[0] ?? "queenstown";

  return (
    <>
      <header className="mx-auto max-w-4xl px-6 py-3 sm:py-6 md:py-10 mb-2">
        <div>
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-3xl font-semibold tracking-tight brand-title">
              <Link href="/" aria-label="Go to DealTown home" className="hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-400 rounded">
                DealTown
              </Link>
            </h1>
            <RegionSwitcher current={currentRegion} />
          </div>
          <p className="text-sm text-muted-foreground">
            All the best local deals in one place.
          </p>
          {/* tagline */}
          <p className="mt-1 text-sm text-muted-foreground/90">
            Find a deal. <span className="font-medium">Share a deal.</span>
          </p>
          
          {/* Actions row below subtitle */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-orange-400/50 transition hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
            >
              Submit a Deal
            </button>

            <HeaderMenu />
          </div>
        </div>
      </header>

      <SubmitDealModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </>
  );
}

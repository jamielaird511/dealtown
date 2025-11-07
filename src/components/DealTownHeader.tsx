"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import HeaderMenu from "@/components/HeaderMenu";
import SubmitDealModal from "@/components/SubmitDealModal";
import RegionSwitcher from "@/components/RegionSwitcher";
import DealMeModal from "@/components/deal-me/DealMeModal";
import { createClient } from "@/lib/supabase/client";

export default function DealTownHeader() {
  const [modalOpen, setModalOpen] = useState(false);
  const [dealMeOpen, setDealMeOpen] = useState(false);
  const pathname = usePathname();
  // pathname like "/", "/queenstown", "/queenstown/deal/123"
  const safePath = pathname ?? "/";
  const parts = safePath.split("/").filter(Boolean);
  const currentRegion = parts[0] ?? "queenstown";
  
  const supabase = createClient();

  const handleDealMeClick = () => {
    // Track analytics event (don't block UI if it fails)
    void supabase.from("analytics_events").insert({
      event_name: "deals_near_me_click",
      region: currentRegion || "unknown",
    });
    
    setDealMeOpen(true);
  };

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
              onClick={handleDealMeClick}
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-orange-400/50 transition hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <path
                  d="M12 2C8.13 2 5 5.13 5 9C5 13.25 12 22 12 22C12 22 19 13.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
                  fill="white"
                />
              </svg>
              <span>Deals Near Me</span>
            </button>
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
      <DealMeModal
        open={dealMeOpen}
        onClose={() => setDealMeOpen(false)}
        currentRegion={currentRegion}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import HeaderMenu from "@/components/HeaderMenu";
import SubmitDealModal from "@/components/SubmitDealModal";

export default function DealTownHeader() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <header className="mx-auto max-w-4xl px-6 py-3 sm:py-6 md:py-10 mb-2">
        <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight brand-title">DealTown</h1>
              <span className="px-3 py-1 text-sm rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                Queenstown
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              All the best local deals in one place.
            </p>
            {/* tagline */}
            <p className="mt-1 text-sm text-muted-foreground/90">
              Find a deal. <span className="font-medium">Share a deal.</span>
            </p>
          </div>
          
          {/* Mobile actions row */}
          <div className="flex sm:hidden gap-2 mt-1">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center h-12 px-4 rounded-xl font-medium bg-orange-500 text-white"
            >
              💡 Submit a Deal
            </button>
            <HeaderMenu />
          </div>
          
          {/* Desktop actions row */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-2xl bg-orange-500 px-4 py-2 font-medium text-white shadow hover:shadow-md transition-shadow"
            >
              💡 Submit a Deal
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

"use client";

import { useState } from "react";
import HeaderMenu from "@/components/HeaderMenu";
import SubmitDealModal from "@/components/SubmitDealModal";

export default function DealTownHeader() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <header className="mx-auto max-w-4xl px-6 py-10 mb-2">
        <div className="flex items-center justify-between">
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
          </div>
          <div className="flex items-center gap-3">
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

// src/app/page.tsx
"use client";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useState } from "react";
import dynamicImport from "next/dynamic";
import DealsSection from "@/components/DealsSection";
import { DayFilterProvider } from "@/components/day/DayFilterContext";
import DayTabs from "@/components/day/DayTabs";
import HeaderMenu from "@/components/HeaderMenu";
import HeaderUserInfo from "@/components/HeaderUserInfo";
import SubmitDealModal from "@/components/SubmitDealModal";
import StickyNav from "@/components/StickyNav";

const FuelCardPretty = dynamicImport(() => import("@/components/FuelCardPretty"), {
  ssr: false,
});



export default function Home({ searchParams }: { searchParams?: { day?: string } }) {
  const [modalOpen, setModalOpen] = useState(false);
  const enableFuel = process.env.NEXT_PUBLIC_ENABLE_FUEL === "true";

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
      {/* Header */}
      <header className="mb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight brand-title">DealTown</h1>
              <span className="px-3 py-1 text-sm rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                Queenstown
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Today's deals and local fuel prices</p>
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

      {/* Signed-in indicator */}
      <HeaderUserInfo />

      {/* Cheapest Fuel Card */}
      {enableFuel ? <FuelCardPretty /> : null}

      {/* Sticky Navigation */}
      <StickyNav />

      {/* Shared Day Filter */}
      <DayFilterProvider>
        <DayTabs />

        {/* Deals Section */}
        <section id="today-deals">
          <DealsSection />
        </section>
      </DayFilterProvider>

      {/* Submit Deal Modal */}
      <SubmitDealModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </main>
  );
}

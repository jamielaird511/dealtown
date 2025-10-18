// src/app/page.tsx
"use client";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import dynamicImport from "next/dynamic";
import DealsSection from "@/components/DealsSection";
import { DayFilterProvider } from "@/components/day/DayFilterContext";
import DayTabs from "@/components/day/DayTabs";
import HeaderUserInfo from "@/components/HeaderUserInfo";
import StickyNav from "@/components/StickyNav";

const FuelCardPretty = dynamicImport(() => import("@/components/FuelCardPretty"), {
  ssr: false,
});



export default function Home({ searchParams }: { searchParams?: { day?: string } }) {
  const enableFuel = process.env.NEXT_PUBLIC_ENABLE_FUEL === "true";

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
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
    </main>
  );
}

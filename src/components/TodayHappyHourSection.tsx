"use client";
import useSWR from "swr";
import HappyHourCard from "@/components/HappyHourCard";

const fetcher = async (u: string) => {
  const res = await fetch(u);
  const text = await res.text();
  if (!text) return { data: [] };      // tolerate empty body
  try {
    return JSON.parse(text);
  } catch {
    // return a shape the UI can handle
    return { data: [], error: `Bad JSON from ${u}: ${text.slice(0, 120)}…` };
  }
};

export default function TodayHappyHourSection() {
  const { data } = useSWR("/api/happy-hours?day=today", fetcher);
  const items = data?.data ?? [];
  const err = data?.error as string | undefined;

  return (
    <section id="happy-hour" className="mt-8">
      <div className="bg-white rounded-2xl shadow-sm border p-4">
        <h3 className="text-xl font-semibold mb-4">
          Happy <span className="text-orange-500">Hour</span>
        </h3>

        {err && <div className="text-sm text-red-600 mb-3">Error: {err}</div>}
        
        {items.length === 0 ? (
          <div className="opacity-70 text-sm">No happy hours today.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((hh: any) => <HappyHourCard key={hh.id} hh={hh} />)}
          </div>
        )}
      </div>
    </section>
  );
}

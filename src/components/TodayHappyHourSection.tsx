"use client";
import useSWR from "swr";
import HappyHourCard from "@/components/HappyHourCard";

const fetcher = async (u: string) => {
  const res = await fetch(u);
  const text = await res.text();
  if (!text) return { data: [] };
  try {
    return JSON.parse(text);
  } catch {
    return { data: [], error: `Bad JSON from ${u}: ${text.slice(0, 120)}…` };
  }
};

function dayIndexFromSlug(slug?: string): number | "today" {
  if (!slug || slug === "today") return "today";
  const m: Record<string, number> = {
    sun: 0,
    sunday: 0,
    mon: 1,
    monday: 1,
    tue: 2,
    tuesday: 2,
    wed: 3,
    wednesday: 3,
    thu: 4,
    thursday: 4,
    fri: 5,
    friday: 5,
    sat: 6,
    saturday: 6,
  };
  const key = slug.toLowerCase();
  return key in m ? m[key] : "today";
}

export default function TodayHappyHourSection({ daySlug }: { daySlug?: string }) {
  const dayIndex = dayIndexFromSlug(daySlug);
  const key =
    typeof dayIndex === "number"
      ? `/api/happy-hours?day=${dayIndex}`
      : `/api/happy-hours?day=today`;

  const { data, error } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    keepPreviousData: false,
  });

  const items = data?.data ?? [];

  return (
    <section id="happy-hour" className="mt-8">
      <div className="bg-white rounded-2xl shadow-sm border p-4">
        <h3 className="text-xl font-semibold mb-4">
          Happy <span className="text-orange-500">Hour</span>
        </h3>

        {error && <div className="text-sm text-red-600">Error loading happy hours.</div>}

        {items.length === 0 ? (
          <div className="opacity-70 text-sm">No happy hours for this day.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((hh: any) => (
              <HappyHourCard key={hh.id} hh={hh} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

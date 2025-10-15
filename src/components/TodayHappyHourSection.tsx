"use client";
import useSWR from "swr";
import HappyHourCard from "@/components/HappyHourCard";
import { useDayFilter } from "@/components/day/DayFilterContext";

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

function dayKeyToIndex(dayKey: string): number | "today" {
  if (dayKey === "today") return "today";
  const m: Record<string, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };
  return m[dayKey] ?? "today";
}

export default function TodayHappyHourSection() {
  const { day } = useDayFilter();
  const dayIndex = dayKeyToIndex(day);
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

  // Sort by start time, then alphabetically by venue name
  const sorted = items.sort((a: any, b: any) => {
    // 1️⃣ Sort by start time (e.g. "15:00:00" vs "16:00:00")
    const timeA = a.start_time ?? "00:00:00";
    const timeB = b.start_time ?? "00:00:00";
    const diff = timeA.localeCompare(timeB);

    if (diff !== 0) return diff;

    // 2️⃣ Then sort alphabetically by venue name
    const nameA = a.venues?.name?.toLowerCase() ?? "";
    const nameB = b.venues?.name?.toLowerCase() ?? "";
    return nameA.localeCompare(nameB);
  });

  return (
    <section id="happy-hour" className="mt-8">
      <div className="bg-white rounded-2xl shadow-sm border p-4">
        <h3 className="text-xl font-semibold mb-4">
          Happy <span className="text-orange-500">Hour</span>
        </h3>

        {error && <div className="text-sm text-red-600">Error loading happy hours.</div>}

        {sorted.length === 0 ? (
          <div className="opacity-70 text-sm">No happy hours for this day.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((hh: any) => (
              <HappyHourCard key={hh.id} hh={hh} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

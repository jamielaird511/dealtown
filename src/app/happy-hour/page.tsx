import StickyNav from "@/components/StickyNav";
import HappyHourCard from "@/components/HappyHourCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Happy Hour | DealTown Queenstown",
  description: "Find today's best Happy Hour deals in Queenstown.",
};

const DAYS = ["today","mon","tue","wed","thu","fri","sat","sun"] as const;
type DayKey = typeof DAYS[number];

function cap(d: DayKey) {
  if (d === "today") return "Today";
  return d.toUpperCase();
}

function DayBox({ active }: { active: DayKey }) {
  const chips = DAYS.map((d) => {
    const href = `/happy-hour?day=${d}`;
    const isActive = d === active;

    return (
      <a
        key={d}
        href={href}
        className={[
          "px-3 py-1.5 rounded-full border text-sm transition",
          isActive
            ? "bg-orange-500 text-white border-orange-500"
            : "bg-white hover:bg-orange-50"
        ].join(" ")}
      >
        {cap(d)}
      </a>
    );
  });

  return (
    <div className="mt-2 rounded-2xl border bg-white p-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-gray-600">Day</span>
        <div className="flex gap-2 flex-wrap">{chips}</div>
      </div>
    </div>
  );
}

async function fetchHappy(day: string) {
  // same absolute-URL logic you already have
  const { headers } = await import("next/headers");
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? process.env.VERCEL_URL ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "development" ? "http" : "https");
  const envBase = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  const base = envBase && /^https?:\/\//i.test(envBase) ? envBase : `${proto}://${host}`;

  const res = await fetch(`${base}/api/happy-hour?day=${encodeURIComponent(day)}`, { cache: "no-store" });
  if (!res.ok) return { items: [] as any[] };
  return res.json();
}

export default async function HappyHourPage({
  searchParams,
}: {
  searchParams?: { [k: string]: string | string[] | undefined };
}) {
  const dayParam = (Array.isArray(searchParams?.day) ? searchParams?.day[0] : searchParams?.day) ?? "today";
  const day = (DAYS as readonly string[]).includes(dayParam) ? (dayParam as DayKey) : "today";

  const { items } = await fetchHappy(day);

  return (
    <main className="max-w-3xl mx-auto p-4">
      <StickyNav />

      {/* Day selector box — matches Daily Deals look */}
      <DayBox active={day} />

      {/* List */}
      <section className="mt-4 rounded-2xl border bg-white p-4">
        <h2 className="text-2xl font-bold">
          Happy <span className="text-orange-500">Hour</span>
        </h2>

        <div className="mt-4 grid gap-3">
          {items.map((it: any) => (
            <HappyHourCard key={it.id} hh={it} />
          ))}
          {items.length === 0 && (
            <div className="text-sm text-gray-600">
              No happy hours listed for {day === "today" ? "Today" : day.toUpperCase()}.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

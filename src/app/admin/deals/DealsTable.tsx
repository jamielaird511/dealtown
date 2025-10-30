"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import SortableHeader from "@/components/SortableHeader";
import { sortBy, type SortDir } from "@/lib/sort";
import { moneyFromCents } from "@/lib/money";
import { ActiveToggle } from "@/components/ActiveToggle";
import { DeleteButton } from "@/components/DeleteButton";

type DealRow = {
  id: string;
  title: string;
  is_active: boolean;
  day_of_week: string;
  price_cents: number | null;
  venue?: { name?: string; address?: string } | null;
};

export default function DealsTable({ deals }: { deals: DealRow[] }) {
  const [sortKey, setSortKey] = useState<"title" | "venue" | "price" | "day">("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sortedDeals = useMemo(() => {
    const keyMap: Record<typeof sortKey, (d: DealRow) => unknown> = {
      title: (d) => d.title,
      venue: (d) => d.venue?.name ?? "",
      price: (d) => d.price_cents,
      day: (d) => d.day_of_week,
    };
    return sortBy<DealRow>(deals, keyMap[sortKey], sortDir);
  }, [deals, sortKey, sortDir]);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="space-y-3 md:space-y-0">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border bg-white">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr className="border-b">
              <th className="p-3 text-left text-sm font-medium">Active</th>
              <th className="p-3 text-left text-sm font-medium">
                <SortableHeader
                  label="Title"
                  active={sortKey === "title"}
                  dir={sortDir}
                  onToggle={() => handleSort("title")}
                />
              </th>
              <th className="p-3 text-left text-sm font-medium">
                <SortableHeader
                  label="Venue"
                  active={sortKey === "venue"}
                  dir={sortDir}
                  onToggle={() => handleSort("venue")}
                />
              </th>
              <th className="p-3 text-left text-sm font-medium">
                <SortableHeader
                  label="Day"
                  active={sortKey === "day"}
                  dir={sortDir}
                  onToggle={() => handleSort("day")}
                />
              </th>
              <th className="p-3 text-left text-sm font-medium">
                <SortableHeader
                  label="Price"
                  active={sortKey === "price"}
                  dir={sortDir}
                  onToggle={() => handleSort("price")}
                />
              </th>
              <th className="p-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedDeals.map((d) => (
              <tr key={d.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <ActiveToggle
                    id={d.id}
                    initial={
                      Number(
                        typeof (d as any).active !== "undefined"
                          ? (typeof (d as any).active === "boolean" ? ((d as any).active ? 1 : 0) : (d as any).active)
                          : (typeof (d as any).is_active === "boolean" ? ((d as any).is_active ? 1 : 0) : (d as any).is_active)
                      )
                    }
                  />
                </td>
                <td className="p-3">{d.title}</td>
                <td className="p-3">
                  <div className="text-sm">{d.venue?.name}</div>
                  <div className="text-xs text-gray-500">{d.venue?.address}</div>
                </td>
                <td className="p-3 text-sm capitalize">{d.day_of_week}</td>
                <td className="p-3 text-sm">
                  {d.price_cents ? `$${moneyFromCents(d.price_cents)}` : "—"}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/${d.id}`} className="text-sm text-blue-600 hover:underline">
                      Edit
                    </Link>
                    <DeleteButton id={d.id} title={d.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {sortedDeals.map((d) => (
          <div key={d.id} className="rounded-xl border bg-white p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">{d.title}</h3>
                <p className="text-sm text-gray-600">{d.venue?.name}</p>
                <p className="text-xs text-gray-500">{d.venue?.address}</p>
              </div>
              {d.price_cents && (
                <span className="text-orange-600 font-semibold">${moneyFromCents(d.price_cents)}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ActiveToggle id={d.id} initial={d.is_active} />
              <span className="capitalize text-gray-600">{d.day_of_week}</span>
            </div>
            <div className="flex gap-2 pt-2">
              <Link href={`/admin/${d.id}`} className="text-sm text-blue-600 hover:underline">
                Edit
              </Link>
              <DeleteButton id={d.id} title={d.title} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

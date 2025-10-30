"use client";
import { useMemo, useState } from "react";
import SortableHeader from "@/components/SortableHeader";
import { sortBy, type SortDir } from "@/lib/sort";
import HappyHourRow from "./HappyHourRow";

type HHRow = {
  id: string;
  venue: string;
  address: string;
  title: string | null;
  details: string | null;
  price_cents: number | null;
  start: string | null;
  end: string | null;
  days: unknown;
  active: boolean;
};

export default function HappyHoursTable({ rows }: { rows: HHRow[] }) {
  const [sortKey, setSortKey] = useState<"venue" | "days" | "time" | "price">("venue");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sortedRows = useMemo(() => {
    const getter = (r: HHRow) => {
      switch (sortKey) {
        case "venue":
          return r.venue;
        case "days":
          return Array.isArray(r.days) ? r.days.join(",") : String(r.days ?? "");
        case "time":
          return r.start ?? "";
        case "price":
          return r.price_cents;
      }
    };
    return sortBy<HHRow>(rows, getter, sortDir);
  }, [rows, sortKey, sortDir]);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <table className="w-full table-auto">
      <thead className="bg-gray-50 text-left text-sm text-gray-600">
        <tr>
          <th className="px-4 py-3 font-medium">Active</th>
          <th className="px-4 py-3 font-medium">
            <SortableHeader
              label="Venue"
              active={sortKey === "venue"}
              dir={sortDir}
              onToggle={() => handleSort("venue")}
            />
          </th>
          <th className="px-4 py-3 font-medium">
            <SortableHeader
              label="Days"
              active={sortKey === "days"}
              dir={sortDir}
              onToggle={() => handleSort("days")}
            />
          </th>
          <th className="px-4 py-3 font-medium">
            <SortableHeader
              label="Time"
              active={sortKey === "time"}
              dir={sortDir}
              onToggle={() => handleSort("time")}
            />
          </th>
          <th className="px-4 py-3 font-medium">
            <SortableHeader
              label="Price"
              active={sortKey === "price"}
              dir={sortDir}
              onToggle={() => handleSort("price")}
            />
          </th>
          <th className="px-4 py-3 font-medium">Details</th>
          <th className="px-4 py-3 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 text-sm">
        {sortedRows.length === 0 ? (
          <tr>
            <td className="px-4 py-6 text-gray-500" colSpan={7}>
              No happy hours yet.
            </td>
          </tr>
        ) : (
          sortedRows.map((h: any) => (
            <HappyHourRow
              key={h.id}
              hh={h}
              // ActiveToggle lives inside HappyHourRow; ensure it receives 0/1
              // If HappyHourRow forwards props, it will use h.active/h.is_active as normalized below
            />
          ))
        )}
      </tbody>
    </table>
  );
}

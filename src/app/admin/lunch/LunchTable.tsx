"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import SortableHeader from "@/components/SortableHeader";
import { sortBy, type SortDir } from "@/lib/sort";

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDays(arr?: number[] | null) {
  if (!arr || arr.length === 0) return "—";
  return [...arr]
    .sort((a, b) => a - b)
    .map((i) => DAY[i])
    .join(", ");
}

function to12h(hhmm?: string | null) {
  if (!hhmm) return "";
  const [h, m] = hhmm.slice(0, 5).split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}
function formatTimeRange(start?: string | null, end?: string | null) {
  const s = to12h(start);
  const e = to12h(end);
  if (!s && !e) return "—";
  if (s && e) return `${s} — ${e}`;
  return s || e || "—";
}

type LunchRow = {
  id: string;
  title: string | null;
  description: string | null;
  price_cents: number | null;
  is_active: boolean;
  days: number[] | null;
  start_time: string | null;
  end_time: string | null;
  venue_name: string | null;
  venue_address: string | null;
};

export default function LunchTable({ rows }: { rows: LunchRow[] }) {
  const [sortKey, setSortKey] = useState<"venue" | "days" | "time" | "price">("venue");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sortedRows = useMemo(() => {
    const getter = (r: LunchRow) => {
      switch (sortKey) {
        case "venue":
          return r.venue_name ?? "";
        case "days":
          return Array.isArray(r.days) ? r.days.join(",") : String(r.days ?? "");
        case "time":
          return r.start_time ?? "";
        case "price":
          return r.price_cents;
      }
    };
    return sortBy<LunchRow>(rows, getter, sortDir);
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
    <div className="mt-6 rounded-2xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 text-left text-neutral-500">
          <tr>
            <th className="py-3 pl-4 pr-2">Active</th>
            <th className="py-3 px-2">
              <SortableHeader
                label="Venue"
                active={sortKey === "venue"}
                dir={sortDir}
                onToggle={() => handleSort("venue")}
              />
            </th>
            <th className="py-3 px-2">
              <SortableHeader
                label="Days"
                active={sortKey === "days"}
                dir={sortDir}
                onToggle={() => handleSort("days")}
              />
            </th>
            <th className="py-3 px-2">
              <SortableHeader
                label="Time"
                active={sortKey === "time"}
                dir={sortDir}
                onToggle={() => handleSort("time")}
              />
            </th>
            <th className="py-3 px-2">
              <SortableHeader
                label="Price"
                active={sortKey === "price"}
                dir={sortDir}
                onToggle={() => handleSort("price")}
              />
            </th>
            <th className="py-3 px-2">Details</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-neutral-500">
                No lunch menus yet.
              </td>
            </tr>
          ) : (
            sortedRows.map((row: any) => {
              const days = formatDays(row.days);
              const time = formatTimeRange(row.start_time, row.end_time);
              return (
                <tr key={row.id} className="border-t align-top">
                  <td className="py-4 pl-4 pr-2">
                    {row.is_active ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 px-2 py-1 text-xs font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-neutral-200 text-neutral-700 px-2 py-1 text-xs font-medium">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-2">
                    <div className="font-medium">{row.venue_name ?? "—"}</div>
                    <div className="text-xs text-neutral-500">{row.venue_address || "—"}</div>
                    {row.title && <div className="text-xs mt-1 opacity-80">{row.title}</div>}
                  </td>

                  <td className="py-4 px-2 whitespace-pre">{days}</td>
                  <td className="py-4 px-2">{time}</td>
                  <td className="py-4 px-2">
                    {row.price_cents != null ? `$${(row.price_cents / 100).toFixed(2)}` : "—"}
                  </td>
                  <td className="py-4 px-2">
                    {row.description ? (
                      <div className="max-w-[34ch] whitespace-pre-line text-neutral-700">
                        {row.description}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/lunch/${row.id}/edit`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <form action={`/api/lunch/${row.id}`} method="post">
                        <input type="hidden" name="_method" value="DELETE" />
                        <button type="submit" className="text-red-600 hover:underline">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

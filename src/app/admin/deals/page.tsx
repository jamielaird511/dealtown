"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import DealsTable from "./DealsTable";

const REGIONS = [
  { value: "queenstown", label: "Queenstown" },
  { value: "wanaka", label: "Wanaka" },
  { value: "dunedin", label: "Dunedin" },
];

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch deals");
  const json = await res.json();
  return json.data || [];
};

export default function AdminDealsPage() {
  const [region, setRegion] = useState("queenstown");
  const { data: deals, error, isLoading } = useSWR(
    `/api/admin/deals?region=${region}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Handle success/error messages from URL params
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("ok")) {
      setMessage({ type: "success", text: "Success!" });
    }
    if (params.get("error")) {
      setMessage({ type: "error", text: params.get("error") || "An error occurred" });
    }
  }, []);

  return (
    <main className="p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Deals</h1>
          <p className="text-sm text-gray-600">Manage daily deals</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <Link
            href="/admin/new"
            className="rounded-lg bg-orange-500 text-white px-4 py-2 font-medium hover:bg-orange-600"
          >
            New Deal
          </Link>
        </div>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          Error loading deals: {error.message}
        </div>
      )}

      {isLoading && (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
          Loading deals...
        </div>
      )}

      {!isLoading && !error && deals && (
        <>
          <DealsTable deals={(deals ?? []) as any} />

          {!deals?.length && (
            <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
              No deals found for {REGIONS.find((r) => r.value === region)?.label || region}.
            </div>
          )}
        </>
      )}
    </main>
  );
}


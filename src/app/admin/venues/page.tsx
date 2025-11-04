"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AdminTable } from "@/components/admin/AdminTable";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import { toggleVenueActive, deleteVenue } from "./actions";

const REGIONS = [
  { value: "queenstown", label: "Queenstown" },
  { value: "wanaka", label: "Wanaka" },
  { value: "dunedin", label: "Dunedin" },
];

function toMsg(err: any, fallback = "Unknown error") {
  try {
    if (!err) return fallback;
    if (typeof err === "string") return err;
    if (err.message) return err.message;
    return JSON.stringify(err);
  } catch {
    return fallback;
  }
}

export default function VenuesPage() {
  const searchParams = useSearchParams();
  const [region, setRegion] = useState("queenstown");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | undefined>();

  useEffect(() => {
    async function loadVenues() {
      setLoading(true);
      setFetchError(undefined);

      const supabase = createClient();
      const { data, error } = await supabase
        .from("venues")
        .select("id, name, address, website_url, active, region")
        .eq("region", region)
        .order("name", { ascending: true });

      if (error) {
        console.error("getVenues error:", {
          code: (error as any).code,
          message: (error as any).message,
          details: (error as any).details,
          hint: (error as any).hint,
        });
        setFetchError(toMsg(error, "Failed to load venues"));
        setLoading(false);
        return;
      }

      setRows(data ?? []);
      setLoading(false);
    }

    loadVenues();
  }, [region]);

  const banner =
    (searchParams?.get("error") ? decodeURIComponent(searchParams.get("error")!) : undefined) ??
    fetchError;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Venues</h1>
          <p className="text-sm text-gray-600">Manage venues</p>
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
            href="/admin/venues/new"
            className="rounded-lg bg-orange-500 text-white px-4 py-2 font-medium hover:bg-orange-600"
          >
            Add Venue
          </Link>
        </div>
      </div>

      {banner && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <strong>Error:</strong> {banner}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
          Loading venues...
        </div>
      )}

      {!loading && (
        <AdminTable
          head={
            <tr>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">Website</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          }
        >
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-gray-500" colSpan={5}>
                {banner ? "There was a problem loading venues." : "No venues yet."}
              </td>
            </tr>
          ) : (
            rows.map((v: any) => (
              <tr key={v.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3">
                  <form action={toggleVenueActive}>
                    <input type="hidden" name="id" value={v.id} />
                    <input type="hidden" name="next" value={(!v.active).toString()} />
                    <button
                      type="submit"
                      className={
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 " +
                        (v.active
                          ? "bg-green-100 text-green-800 ring-green-200"
                          : "bg-gray-100 text-gray-700 ring-gray-200")
                      }
                      title={v.active ? "Click to deactivate" : "Click to activate"}
                    >
                      {v.active ? "Active" : "Inactive"}
                    </button>
                  </form>
                </td>

                <td className="px-4 py-3">{v.name}</td>
                <td className="px-4 py-3">{v.address ?? "—"}</td>
                <td className="px-4 py-3">
                  {v.website_url ? (
                    <a
                      className="text-blue-600 hover:underline"
                      href={v.website_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {v.website_url}
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Link href={`/admin/venues/${v.id}`} className="text-blue-600 hover:underline">
                      Edit
                    </Link>
                    <form action={deleteVenue}>
                      <input type="hidden" name="id" value={v.id} />
                      <ConfirmDeleteButton message={`Delete ${v.name}?`} />
                    </form>
                  </div>
                </td>
              </tr>
            ))
          )}
        </AdminTable>
      )}
    </section>
  );
}

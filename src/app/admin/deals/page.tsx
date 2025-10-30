// src/app/admin/deals/page.tsx
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import DealsTable from "./DealsTable";

// Force dynamic rendering - never cache admin pages
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDealsPage() {
  const { user, supabase } = await requireAdmin();

  const { data: deals, error: dealsError } = await supabase
    .from("deals")
    .select(`
      *,
      venue:venues!deals_venue_fk(
        id,
        name,
        address,
        website_url
      )
    `)
    .order("price_cents", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(50);

  if (dealsError) {
    console.error("Admin deals query error:", dealsError);
  }

  return (
    <main className="p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Deals</h1>
          <p className="text-sm text-gray-600">Manage daily deals</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/new"
            className="rounded-lg bg-orange-500 text-white px-4 py-2 font-medium hover:bg-orange-600"
          >
            New Deal
          </Link>
        </div>
      </div>

      {/* Success/Error Messages */}
      {typeof window !== "undefined" && new URLSearchParams(window.location.search).get("ok") && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
          Success!
        </div>
      )}
      {typeof window !== "undefined" && new URLSearchParams(window.location.search).get("error") && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {new URLSearchParams(window.location.search).get("error")}
        </div>
      )}

      <DealsTable deals={(deals ?? []) as any} />

      {!deals?.length && (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
          No deals yet.
        </div>
      )}
    </main>
  );
}


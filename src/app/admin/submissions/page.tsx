// src/app/admin/submissions/page.tsx
import { createClient } from "@supabase/supabase-js";
import { renderTimeRange } from "@/lib/time";

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function DealSubmissionsPage() {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("deal_submissions")
    .select("id, created_at, venue_name, deal_title, title, description, days, start_time, end_time, submitter_email, status")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("admin/submissions fetch error:", error);
  }

  const rows = data ?? [];

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Deal Submissions</h1>
        <span className="text-sm text-gray-500">{rows.length} total</span>
      </div>

      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{r.deal_title || r.title}</h2>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">{r.status}</span>
            </div>
            <p className="text-sm text-gray-600">{r.venue_name}</p>
            {r.description && <p className="mt-2">{r.description}</p>}

            <div className="mt-2 text-sm text-gray-600">
              {r.days?.length ? <div>Days: {r.days.join(", ")}</div> : null}
              {(r.start_time || r.end_time) ? (
                <div>Time: {renderTimeRange(r.start_time, r.end_time) || "—"}</div>
              ) : null}
              {r.submitter_email ? <div>Submitted by: {r.submitter_email}</div> : null}
            </div>

            <p className="mt-2 text-xs text-gray-400">Submitted: {new Date(r.created_at).toLocaleString()}</p>
          </div>
        ))}

        {!rows.length && (
          <p className="text-sm text-gray-500">No submissions yet.</p>
        )}
      </div>
    </main>
  );
}

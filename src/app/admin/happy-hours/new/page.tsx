"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DayPicker from "@/components/DayPicker";
import { getDowInZone } from "@/lib/time";
import Link from "next/link";

type Venue = { id: number; name: string };

// Normalize time from "04:00 pm" or "16:00" to "HH:mm"
function normalizeTime(t: string) {
  if (!t) return t;
  // Already 24h? keep "HH:mm"
  const m24 = t.match(/^(\d{2}):(\d{2})(:\d{2})?$/);
  if (m24) return `${m24[1]}:${m24[2]}`;

  // "h:mm am/pm" -> "HH:mm"
  const m12 = t.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (m12) {
    let h = parseInt(m12[1], 10) % 12;
    if (m12[3].toLowerCase() === "pm") h += 12;
    return `${String(h).padStart(2, "0")}:${m12[2]}`;
  }
  return t;
}

export default function NewHappyHourPage() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [flash, setFlash] = useState<null | { type: "success" | "error"; msg: string }>(null);
  const [form, setForm] = useState<any>({
    venue_id: 0,
    details: "",
    price_cents: undefined,
    start_time: "16:00",
    end_time: "18:00",
    days: [getDowInZone("Pacific/Auckland")],
    active_from: "",
    active_to: "",
    is_active: true,
    website_url: "",
  });

  useEffect(() => {
    fetch("/api/venues")
      .then((r) => r.json())
      .then((v) => setVenues(v.data || []));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFlash(null);

    const payload = {
      ...form,
      venue_id: Number(form.venue_id),
      start_time: normalizeTime(form.start_time),
      end_time: normalizeTime(form.end_time),
      website_url: form.website_url?.trim() || undefined,
      active_from: form.active_from || undefined,
      active_to: form.active_to || undefined,
      // days: form.days (keep as numbers - schema will normalize to strings)
    };

    try {
      const res = await fetch("/api/happy-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const j = await res.json().catch(() => ({}));

      if (!res.ok || j?.error) {
        let errorMsg = "Save failed";
        
        if (j?.error) {
          // Handle zod validation errors
          if (typeof j.error === "object" && j.error.fieldErrors) {
            const fieldErrors = Object.entries(j.error.fieldErrors)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
              .join("; ");
            errorMsg = `Validation errors: ${fieldErrors}`;
          } else if (typeof j.error === "string") {
            errorMsg = j.error;
          } else if (j.error.message) {
            errorMsg = j.error.message;
          } else {
            errorMsg = JSON.stringify(j.error);
          }
        }
        
        setFlash({ type: "error", msg: errorMsg });
        return;
      }

      // Success - redirect to list
      router.push("/admin/happy-hours");
    } catch (err: any) {
      const errorMsg = typeof err === "string" 
        ? err 
        : err?.message ?? err?.error ?? JSON.stringify(err);
      setFlash({ type: "error", msg: errorMsg });
    } finally {
      setSubmitting(false);
      setTimeout(() => setFlash(null), 3000);
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Happy Hour</h1>
        <Link href="/admin/happy-hours" className="text-sm text-gray-600 hover:underline">
          Back to list
        </Link>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-sm font-medium mb-1">Venue *</span>
              <select
                value={form.venue_id}
                onChange={(e) => setForm((f: any) => ({ ...f, venue_id: Number(e.target.value) }))}
                className="border rounded px-3 py-2"
              >
                <option value={0}>Select a venue…</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col">
              <span className="text-sm font-medium mb-1">Details</span>
              <input
                className="border rounded px-3 py-2"
                value={form.details}
                onChange={(e) => setForm((f: any) => ({ ...f, details: e.target.value }))}
                placeholder="e.g. All house beers and wines"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm font-medium mb-1">Price (dollars)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="border rounded px-3 py-2"
                value={form.price_cents != null ? (form.price_cents / 100).toFixed(2) : ""}
                onChange={(e) =>
                  setForm((f: any) => ({
                    ...f,
                    price_cents: e.target.value === "" ? undefined : Math.round(Number(e.target.value) * 100),
                  }))
                }
                placeholder="e.g. 6.00"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm font-medium mb-1">Website (optional)</span>
              <input
                type="url"
                className="border rounded px-3 py-2"
                value={form.website_url}
                onChange={(e) => setForm((f: any) => ({ ...f, website_url: e.target.value }))}
                placeholder="Leave blank to use venue website"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm font-medium mb-1">Start *</span>
              <input
                type="time"
                className="border rounded px-3 py-2"
                value={form.start_time}
                onChange={(e) => setForm((f: any) => ({ ...f, start_time: e.target.value }))}
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm font-medium mb-1">End *</span>
              <input
                type="time"
                className="border rounded px-3 py-2"
                value={form.end_time}
                onChange={(e) => setForm((f: any) => ({ ...f, end_time: e.target.value }))}
              />
            </label>
          </div>

          <div>
            <span className="text-sm font-medium block mb-1">Days *</span>
            <DayPicker value={form.days} onChange={(d) => setForm((f: any) => ({ ...f, days: d }))} />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f: any) => ({ ...f, is_active: e.target.checked }))}
              />
              <span className="text-sm">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm">Active From</span>
              <input
                type="date"
                className="border rounded px-2 py-1"
                value={form.active_from}
                placeholder="yyyy-mm-dd"
                onChange={(e) => setForm((f: any) => ({ ...f, active_from: e.target.value }))}
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm">Active To</span>
              <input
                type="date"
                className="border rounded px-2 py-1"
                value={form.active_to}
                placeholder="yyyy-mm-dd"
                onChange={(e) => setForm((f: any) => ({ ...f, active_to: e.target.value }))}
              />
            </label>
          </div>

          {flash && (
            <div
              className={`text-sm p-3 rounded ${
                flash.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              {flash.msg}
            </div>
          )}

          <div className="flex gap-3">
            <button
              className={`px-4 py-2 rounded ${
                submitting
                  ? "opacity-60 cursor-not-allowed bg-gray-400"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
              type="submit"
              disabled={submitting || !form.venue_id || form.days.length === 0}
            >
              {submitting ? "Saving…" : "Save Happy Hour"}
            </button>
            <Link
              href="/admin/happy-hours"
              className="px-4 py-2 rounded border hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}


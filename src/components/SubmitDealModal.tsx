"use client";
import React, { useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Optional override for API endpoint; defaults to "/api/deal-submissions" */
  apiPath?: string;
};

const DAYS: { key: string; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

export default function SubmitDealModal({ open, onClose, apiPath = "/api/deal-submissions" }: Props) {
  const [venueName, setVenueName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return venueName.trim().length > 1 && title.trim().length > 1 && days.length > 0;
  }, [venueName, title, days]);

  const toggleDay = (key: string) => {
    setDays((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    // Simple client-side guardrails to filter out non-deals
    const lower = `${title} ${description}`.toLowerCase();
    const bannedPhrases = ["set menu", "standard menu", "lunch menu", "everyday price", "ongoing promotion"];
    if (bannedPhrases.some((p) => lower.includes(p))) {
      setSubmitting(false);
      setError("This looks like a regular/ongoing menu item, not a time-limited deal.");
      return;
    }

    try {
      const payload = {
        venue_name: venueName.trim(),
        deal_title: title.trim(),
        description: description.trim(),
        days, // ["mon","tue",...]
        start_time: startTime || null, // "16:00"
        end_time: endTime || null,     // "18:00"
        submitter_email: email || null,
        // Optional flag your API can use to mark as pending moderation
        status: "pending_review",
        // Optional type—align with your existing schema if you have one
        category: "daily_deal", // or "happy_hour" depending on admin triage later
      };

      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed with ${res.status}`);
      }

      setSuccess("✅ Thanks! Your deal has been submitted for review and will appear once verified.");
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
        // Reset form fields after close
        setVenueName("");
        setTitle("");
        setDescription("");
        setDays([]);
        setStartTime("");
        setEndTime("");
        setEmail("");
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden="true"
        onClick={() => !submitting && onClose()}
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold">Submit a Deal</h2>
          <button
            className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
            onClick={() => !submitting && onClose()}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Preamble / Guardrails */}
        <div className="mt-3 text-sm text-gray-600">
          DealTown is for <strong>time-limited, genuine discounts or specials</strong> — something cheaper or better than the usual offer.
          <div className="mt-2">
            <span className="font-medium">✅ Examples:</span> $8 pints today 4–6pm, Half-price pizza Tuesdays.
          </div>
          <div>
            <span className="font-medium">❌ Not accepted:</span> standard lunch menus or ongoing promotions at regular price.
          </div>
          <div className="mt-1">All submissions are reviewed before publishing.</div>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium">Venue name</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g., John's Brew Bar"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Deal title</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g., $8 House Pints (4–6pm)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Description (what's included / terms)</label>
            <textarea
              className="min-h-[90px] w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Any conditions, exclusions, or details helpful to users."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => {
                const active = days.includes(d.key);
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => toggleDay(d.key)}
                    className={`rounded-full border px-3 py-1 text-sm ${active ? "border-orange-500 bg-orange-50" : "border-gray-300 bg-white hover:bg-gray-50"}`}
                    aria-pressed={active}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Start time (optional)</label>
              <input
                type="time"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">End time (optional)</label>
              <input
                type="time"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Your email (optional, for verification)</label>
            <input
              type="email"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-700">{success}</p>}

          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              onClick={() => !submitting && onClose()}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

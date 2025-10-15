const RESEND_API = "https://api.resend.com/emails";

export type SubmissionEmailPayload = {
  id: string | null;
  venue_name: string;
  deal_title: string;
  description?: string | null;
  days?: string[] | null;
  start_time?: string | null;
  end_time?: string | null;
  submitter_email?: string | null;
};

export async function sendSubmissionEmailHTTP(p: SubmissionEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY missing; skipping email.");
    return;
  }
  const from = process.env.NOTIFY_FROM || "DealTown <notifications@dealtown.co.nz>";
  const to = process.env.NOTIFY_TO || "jamie.laird@dealtown.co.nz";

  const subject = `New Deal Submission: ${p.deal_title} @ ${p.venue_name}`;
  const lines = [
    `Venue: ${p.venue_name}`,
    `Title: ${p.deal_title}`,
    p.description ? `Description: ${p.description}` : null,
    p.days?.length ? `Days: ${p.days.join(", ")}` : null,
    (p.start_time || p.end_time) ? `Time: ${p.start_time ?? "—"} → ${p.end_time ?? "—"}` : null,
    p.submitter_email ? `Submitted by: ${p.submitter_email}` : null,
    p.id ? `Record ID: ${p.id}` : null,
  ].filter(Boolean).join("\n");

  const html = `<div>
    <h2 style="font-family:system-ui;margin:0 0 8px 0;">New Deal Submission</h2>
    <pre style="font-family:ui-monospace,Menlo,Consolas,monospace;background:#f6f6f6;padding:12px;border-radius:10px;white-space:pre-wrap">${lines}</pre>
    <p style="font-family:system-ui;margin-top:12px">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin/submissions">Open submissions</a>
    </p>
  </div>`;

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.warn("[email] Resend HTTP failed:", res.status, text);
  }
}

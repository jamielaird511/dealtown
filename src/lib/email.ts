import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY;
if (!resendKey) {
  console.warn("[email] RESEND_API_KEY missing; email sending will fail.");
}
const resend = new Resend(resendKey || "missing");

type SendOpts = { to?: string; subject: string; html: string };

export async function sendHtmlEmail({ to, subject, html }: SendOpts) {
  const from = process.env.SUBMISSIONS_FROM_EMAIL || "DealTown <no-reply@dealtown.co.nz>";
  const recipient = to || process.env.SUBMISSIONS_TO_EMAIL || "hello@dealtown.co.nz";
  return resend.emails.send({ from, to: recipient, subject, html });
}


const DAY_LABELS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function formatDays(days: unknown): string {
  if (!Array.isArray(days) || days.length === 0) return "—";
  const nums = (days as any[])
    .map((d) => Number(String(d).trim()))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
  return nums.length ? nums.map((n) => DAY_LABELS[n]).join(", ") : "—";
}

const CATEGORY_LABELS: Record<string, string> = {
  "daily-deal": "Daily Deal",
  "daily_deal": "Daily Deal",
  "daily deal": "Daily Deal",
  "dailydeal": "Daily Deal",

  "lunch-special": "Lunch Specials",
  "lunch_special": "Lunch Specials",
  "lunch-specials": "Lunch Specials",
  "lunch_specials": "Lunch Specials",
  "lunch specials": "Lunch Specials",
  "lunchspecials": "Lunch Specials",

  "happy-hour": "Happy Hour",
  "happy_hour": "Happy Hour",
  "happy hour": "Happy Hour",
  "happyhour": "Happy Hour",
};

function formatCategory(cat: unknown): string {
  const key = String(cat ?? "").toLowerCase();
  return CATEGORY_LABELS[key] ?? "—";
}

export async function sendSubmissionEmailHTTP(payload: {
  id?: string | number | null;
  venue_name?: string;
  deal_title?: string;
  description?: string | null;
  days?: string[];
  start_time?: string | null;
  end_time?: string | null;
  submitter_email?: string | null;
  category?: string | null;
}) {
  const FROM = process.env.SUBMISSIONS_FROM_EMAIL!;
  const TO = process.env.SUBMISSIONS_TO_EMAIL!;
  const KEY = process.env.RESEND_API_KEY!;

  if (!KEY) {
    console.warn("[resend] RESEND_API_KEY missing; skipping email send");
    return;
  }
  const resend = new Resend(KEY);

  const catLabel = formatCategory(payload.category);
  const subject = `New Deal Submission${catLabel !== "—" ? ` (${catLabel})` : ""}: ${payload.deal_title ?? "(Untitled)"} — ${payload.venue_name ?? ""}`;
  const html = `
    <h2>New Deal Submission</h2>
    <table style="font-family:system-ui,Segoe UI,Arial;font-size:14px;border-collapse:collapse" border="1" cellpadding="6">
      <tr><th align="left">Venue</th><td>${payload.venue_name ?? ""}</td></tr>
      <tr><th align="left">Title</th><td>${payload.deal_title ?? ""}</td></tr>
      <tr><th align="left">Days</th><td>${formatDays(payload.days)}</td></tr>
      <tr><th align="left">Time</th><td>${payload.start_time ?? ""} – ${payload.end_time ?? ""}</td></tr>
      <tr><th align="left">Category</th><td>${formatCategory(payload.category)}</td></tr>
      <tr><th align="left">Notes</th><td>${payload.description ?? ""}</td></tr>
      <tr><th align="left">Submitter</th><td>${payload.submitter_email ?? ""}</td></tr>
      <tr><th align="left">Submission ID</th><td>${payload.id ?? ""}</td></tr>
    </table>
    <p style="font-family:system-ui,Segoe UI,Arial;font-size:12px;color:#666">Sent by DealTown</p>
  `;

  const result = await resend.emails.send({
    from: FROM,
    to: TO,
    subject,
    html,
  });

  console.log("[resend] sent", result?.data?.id ?? result);
}

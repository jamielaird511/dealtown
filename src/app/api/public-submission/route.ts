import { NextResponse } from "next/server";
import { SubmissionSchema } from "@/lib/validators";
import { sendHtmlEmail } from "@/lib/email";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { renderTimeRange } from "@/lib/time";

const cache = new Map<string, number>(); // simple per-IP throttle

const supabase =
  process.env.SUBMISSION_LOG_TO_SUPABASE === "true"
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
    : null;

function sha8(s: string) {
  return crypto.createHash("sha1").update(s).digest("hex").slice(0, 8);
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  const ua = req.headers.get("user-agent") || "";

  // 60s IP throttle
  const now = Date.now();
  const last = cache.get(ip) || 0;
  if (now - last < 60_000) {
    return NextResponse.json({ error: "Too many submissions. Please try again shortly." }, { status: 429 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Anti-bot: honeypot + min time on page
  if (body.company) return NextResponse.json({ ok: true }); // silently ignore
  if (typeof body.ttfb_ms === "number" && body.ttfb_ms < 1500) {
    return NextResponse.json({ error: "Please take a moment to complete the form." }, { status: 400 });
  }

  // Validate
  let data: any;
  try {
    data = SubmissionSchema.parse(body);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  // Build quick-add admin link with prefill
  const params = new URLSearchParams();
  params.set("type", data.type);
  params.set("venue", data.venue_name);
  if (data.title) params.set("title", String(data.title));
  if (data.banner_title) params.set("banner_title", String(data.banner_title));
  if (data.tagline) params.set("tagline", String(data.tagline));
  if (data.price) params.set("price", String(data.price));
  if (data.price_from) params.set("price_from", String(data.price_from));
  if (Array.isArray(data.days)) params.set("days", data.days.join(","));
  if (data.weekdays !== undefined) params.set("weekdays", String(data.weekdays));
  if (data.start_time) params.set("start_time", data.start_time);
  if (data.end_time) params.set("end_time", data.end_time);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dealtown.co.nz";
  const adminPath =
    data.type === "daily-deal"
      ? "/admin/new"
      : data.type === "lunch-special"
      ? "/admin/new"
      : "/admin/happy-hours/new";
  const quickAddUrl = `${baseUrl}${adminPath}?${params.toString()}`;

  // Compose summary table
  const rows: [string, string][] = [
    ["Type", data.type],
    ["Venue", data.venue_name],
    ["Suburb", data.venue_suburb || "—"],
    ["Website", data.website_url || "—"],
    ["Title", data.title || data.banner_title || "—"],
    ["Tagline", data.tagline || data.offer_summary || "—"],
    ["Days", Array.isArray(data.days) ? data.days.join(", ") : data.weekdays ? "Weekdays" : "—"],
    ["Time", renderTimeRange(data.start_time, data.end_time) || "—"],
    ["Submitter", data.submitter_email],
  ];

  const subject = `[DealTown] ${data.type.toUpperCase()} — ${data.venue_name}`;
  const html = `
  <div style="font-family:Inter,system-ui,Segoe UI,Arial,sans-serif;line-height:1.5">
    <h2 style="margin:0 0 10px">New ${data.type} submission</h2>
    <table style="border-collapse:collapse;width:100%;font-size:14px">
      ${rows
        .map(([k, v]) => `<tr><td style="padding:6px 8px;color:#666;width:140px">${k}</td><td style="padding:6px 8px;color:#111">${v}</td></tr>`)
        .join("")}
    </table>
    <p style="margin:14px 0">
      <a href="${quickAddUrl}" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:10px 14px;border-radius:12px">Open in Admin (prefilled)</a>
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:12px 0" />
    <pre style="font-size:12px;background:#fafafa;border:1px solid #eee;border-radius:8px;padding:8px;overflow:auto">${JSON.stringify(
      data,
      null,
      2
    )}</pre>
    <p style="color:#999;font-size:12px;margin-top:8px">ip:${ip} ua:${sha8(ua)}</p>
  </div>`.trim();

  // Send email
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
  }
  await sendHtmlEmail({ subject, html });

  // Optional audit log
  if (supabase) {
    await supabase.from("public_submissions").insert({
      payload_json: data,
      ip,
      user_agent: ua,
    });
  }

  cache.set(ip, now);
  console.info("[submission] %s | %s | %s", data.type, data.venue_name, sha8(JSON.stringify(data)));
  return NextResponse.json({ ok: true });
}
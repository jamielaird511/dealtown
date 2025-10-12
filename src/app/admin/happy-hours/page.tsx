import AdminHeader from "@/components/admin/AdminHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import {
  getSupabaseServerComponentClient,
  getSupabaseServerActionClient,
} from "@/lib/supabaseClients";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

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

function fmtDays(v: unknown): string {
  if (Array.isArray(v)) {
    const arr = v.map((x: any) =>
      typeof x === "number" ? x : DAY_LABELS.indexOf(String(x))
    );
    return arr
      .filter((n: any) => n >= 0)
      .map((n: any) => DAY_LABELS[n])
      .join(", ");
  }
  if (typeof v === "string") {
    const parts = v
      .replace(/[{}]/g, "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return "";
    if (/^\d+$/.test(parts[0])) {
      return parts.map((p) => DAY_LABELS[Number(p) % 7]).join(", ");
    }
    return parts.join(", ");
  }
  return "";
}

async function getHappyHoursSafe(): Promise<{ rows: any[]; errorMsg?: string }> {
  const supabase = getSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("happy_hours")
    .select(`
      id, title, details, price_cents, start_time, end_time, days, is_active,
      venues:venues!happy_hours_venue_id_fkey ( id, name, address )
    `)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("getHappyHours error:", {
      code: (error as any).code,
      message: (error as any).message,
      details: (error as any).details,
      hint: (error as any).hint,
    });
    return { rows: [], errorMsg: toMsg(error, "Failed to load happy hours") };
  }

  const rows =
    (data ?? []).map((h: any) => ({
      id: h.id,
      venue: h.venues?.name ?? "—",
      address: h.venues?.address ?? "",
      title: h.title,
      details: h.details,
      price_cents: h.price_cents,
      start: h.start_time,
      end: h.end_time,
      days: h.days, // keep raw
      active: !!h.is_active,
    })) ?? [];

  return { rows };
}

// Actions (toggle/delete) unchanged in spirit; showing final forms:
export async function toggleHappyHourActive(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const next = String(formData.get("next")) === "true";
  const supabase = getSupabaseServerActionClient();

  try {
    const { error } = await supabase
      .from("happy_hours")
      .update({ is_active: next })
      .eq("id", id);
    if (error) {
      console.error("toggleHappyHourActive error:", error);
      throw new Error(toMsg(error, "Failed to update happy hour status"));
    }
  } catch (e: any) {
    revalidatePath("/admin/happy-hours");
    redirect(`/admin/happy-hours?error=${encodeURIComponent(toMsg(e))}`);
  }

  revalidatePath("/admin/happy-hours");
}

export async function deleteHappyHour(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const supabase = getSupabaseServerActionClient();

  try {
    const { error } = await supabase.from("happy_hours").delete().eq("id", id);
    if (error) {
      console.error("deleteHappyHour error:", error);
      throw new Error(toMsg(error, "Failed to delete happy hour"));
    }
  } catch (e: any) {
    revalidatePath("/admin/happy-hours");
    redirect(`/admin/happy-hours?error=${encodeURIComponent(toMsg(e))}`);
  }

  revalidatePath("/admin/happy-hours");
}

export default async function HappyHoursPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const { rows, errorMsg } = await getHappyHoursSafe();
  const banner = searchParams?.error ? decodeURIComponent(searchParams.error) : errorMsg;

  return (
    <section className="space-y-4">
      <AdminHeader
        title="Happy Hour"
        subtitle="Times & days for drink specials"
        ctaHref="/admin/happy-hours/new"
        ctaLabel="New Happy Hour"
      />

      {banner && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <strong>Error:</strong> {banner}
        </div>
      )}

      <AdminTable
        head={
          <tr>
            <th className="px-4 py-3 font-medium">Active</th>
            <th className="px-4 py-3 font-medium">Venue</th>
            <th className="px-4 py-3 font-medium">Days</th>
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Details</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        }
      >
        {rows.length === 0 ? (
          <tr>
            <td className="px-4 py-6 text-gray-500" colSpan={7}>
              {banner ? "There was a problem loading happy hours." : "No happy hours yet."}
            </td>
          </tr>
        ) : (
          rows.map((h: any) => (
            <tr key={h.id} className="hover:bg-gray-50/60">
              <td className="px-4 py-3">
                <form action={toggleHappyHourActive}>
                  <input type="hidden" name="id" value={h.id} />
                  <input type="hidden" name="next" value={(!h.active).toString()} />
                  <button
                    type="submit"
                    className={
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 " +
                      (h.active
                        ? "bg-green-100 text-green-800 ring-green-200"
                        : "bg-gray-100 text-gray-700 ring-gray-200")
                    }
                    title={h.active ? "Click to deactivate" : "Click to activate"}
                  >
                    {h.active ? "Active" : "Inactive"}
                  </button>
                </form>
              </td>

              <td className="px-4 py-3">
                <div className="font-medium">{h.venue}</div>
                {h.address ? <div className="text-xs text-gray-500">{h.address}</div> : null}
              </td>

              <td className="px-4 py-3">{fmtDays(h.days) || "—"}</td>
              <td className="px-4 py-3">
                {h.start?.slice(0, 5)}–{h.end?.slice(0, 5)}
              </td>
              <td className="px-4 py-3">
                {h.price_cents ? `$${(h.price_cents / 100).toFixed(2)}` : "—"}
              </td>
              <td className="px-4 py-3">{h.details ?? "—"}</td>

              <td className="px-4 py-3">
                <div className="flex items-center gap-3 text-sm">
                  <Link
                    href={`/admin/happy-hours/${h.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <form action={deleteHappyHour}>
                    <input type="hidden" name="id" value={h.id} />
                    <ConfirmDeleteButton message={`Delete happy hour at ${h.venue}?`} />
                  </form>
                </div>
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </section>
  );
}

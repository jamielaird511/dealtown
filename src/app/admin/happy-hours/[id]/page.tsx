import AdminHeader from "@/components/admin/AdminHeader";
import {
  getSupabaseServerComponentClient,
  getSupabaseServerActionClient,
} from "@/lib/supabaseClients";
import { revalidatePath } from "next/cache";
import { redirect, notFound } from "next/navigation";

type PageProps = { params: { id: string } };

export const dynamic = "force-dynamic";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

function toDayIndices(v: unknown): DayIndex[] {
  if (Array.isArray(v)) {
    // could be ["Mon","Tue"] or [1,2,3]
    if (typeof v[0] === "number")
      return (v as number[]).map((n) => n % 7) as DayIndex[];
    return (v as any[])
      .map((x) => DAY_LABELS.indexOf(String(x) as any))
      .filter((n) => n >= 0) as DayIndex[];
  }
  if (typeof v === "string") {
    // handle "{1,2,3}" or "{Mon,Tue}"
    const parts = v
      .replace(/[{}]/g, "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return [];
    if (/^\d+$/.test(parts[0])) {
      return parts
        .map((p) => parseInt(p, 10) % 7)
        .filter((n) => !Number.isNaN(n)) as DayIndex[];
    }
    return parts
      .map((p) => DAY_LABELS.indexOf(p as any))
      .filter((n) => n >= 0) as DayIndex[];
  }
  return [];
}

async function getHappyHour(id: string) {
  const supabase = getSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("happy_hours")
    .select("id, venue_id, start_time, end_time, days, details, is_active, venues(name)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export default async function EditHappyHourPage({ params }: PageProps) {
  const hh = await getHappyHour(params.id).catch(() => null);
  if (!hh) return notFound();

  // 🔹 Server Action: update record with assertions
  async function updateHappyHour(formData: FormData) {
    "use server";
    const supabase = getSupabaseServerActionClient();

    const id = String(formData.get("id"));

    // Coerce fields
    const venue_id_raw = formData.get("venue_id");
    const venue_id =
      venue_id_raw && String(venue_id_raw).trim() !== "" ? Number(venue_id_raw) : null;

    // Browser submits type="time" as "HH:MM" in 24h; DB is time → OK
    const start_time = String(formData.get("start_time") ?? "") || null;
    const end_time = String(formData.get("end_time") ?? "") || null;

    const details = String(formData.get("details") ?? "").trim() || null;
    const is_active = formData.get("is_active") === "on";

    // IMPORTANT: your DB keeps int[] indices (0=Sun..6=Sat)
    const days = formData
      .getAll("days")
      .map((v) => Number(v))
      .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);

    const payload: any = { details, start_time, end_time, is_active, days };
    if (venue_id !== null) payload.venue_id = venue_id;

    // Debug once if needed:
    // console.log("updateHappyHour payload", payload);

    const { data, error } = await supabase
      .from("happy_hours")
      .update(payload)
      .eq("id", id)
      .select("id, details, days, start_time, end_time")
      .maybeSingle();

    if (error) {
      revalidatePath("/admin/happy-hours");
      redirect(
        `/admin/happy-hours?error=${encodeURIComponent(
          error.message ?? "Failed to update happy hour"
        )}`
      );
    }

    if (!data) {
      revalidatePath("/admin/happy-hours");
      redirect(
        `/admin/happy-hours?error=${encodeURIComponent(
          "No row updated (check RLS / id)"
        )}`
      );
    }

    revalidatePath("/admin/happy-hours");
    redirect("/admin/happy-hours");
  }

  // Normalize days to indices for pre-checking
  const selectedIdx = new Set(toDayIndices(hh.days));

  return (
    <section className="space-y-4">
      <AdminHeader
        title="Edit Happy Hour"
        subtitle={hh.venues?.name ? `Venue: ${hh.venues.name}` : ""}
        ctaHref="/admin/happy-hours"
        ctaLabel="Back to List"
      />

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <form action={updateHappyHour} className="space-y-6">
          <input type="hidden" name="id" value={hh.id} />

          {/* Details */}
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="details">
              Details
            </label>
            <input
              id="details"
              name="details"
              defaultValue={hh.details ?? ""}
              placeholder="$9.50 Select Beers, $10 Select Wines"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          {/* Optional venue change */}
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="venue_id">
              Venue ID (optional)
            </label>
            <input
              id="venue_id"
              name="venue_id"
              type="number"
              defaultValue={hh.venue_id ?? ""}
              placeholder="Leave blank to keep current"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          {/* Times */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="start_time">
                Start
              </label>
              <input
                id="start_time"
                name="start_time"
                type="time"
                defaultValue={hh.start_time ?? ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="end_time">
                End
              </label>
              <input
                id="end_time"
                name="end_time"
                type="time"
                defaultValue={hh.end_time ?? ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          {/* Days — checkboxes with numeric values (0-6) */}
          <div className="grid gap-2">
            <span className="text-sm font-medium">Days</span>
            <div className="flex flex-wrap gap-4">
              {DAY_LABELS.map((label, idx) => {
                const id = `day-${idx}`;
                return (
                  <label key={label} htmlFor={id} className="flex items-center gap-2">
                    <input
                      id={id}
                      type="checkbox"
                      name="days"
                      value={idx}
                      defaultChecked={selectedIdx.has(idx)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-gray-500">Tick the days this happy hour applies to.</p>
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              defaultChecked={!!hh.is_active}
              className="h-4 w-4"
            />
            <label htmlFor="is_active" className="text-sm">
              Active
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-xl bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
            >
              Save Changes
            </button>
            <a
              href="/admin/happy-hours"
              className="rounded-xl border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}

import AdminHeader from "@/components/admin/AdminHeader";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewVenuePage() {
  // Ensure admin before rendering form
  await requireAdmin();

  // 🔹 Server Action: create venue
  async function createVenue(formData: FormData) {
    "use server";
    const { supabase } = await requireAdmin();
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim() || null,
      website_url: String(formData.get("website_url") ?? "").trim() || null,
      region: String(formData.get("region") ?? "queenstown").toLowerCase().trim(),
    };

    const { error } = await supabase.from("venues").insert(payload);
    if (error) throw error;

    revalidatePath("/admin/venues");
    redirect("/admin/venues");
  }

  return (
    <section className="space-y-4">
      <AdminHeader
        title="New Venue"
        subtitle="Add a venue"
        ctaHref="/admin/venues"
        ctaLabel="Back to List"
      />

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <form action={createVenue} className="space-y-6">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="name">
              Name *
            </label>
            <input
              id="name"
              name="name"
              required
              placeholder="e.g., Fergburger"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="address">
              Address
            </label>
            <input
              id="address"
              name="address"
              placeholder="e.g., 45 Ballarat Street, Queenstown"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="website_url">
              Website URL
            </label>
            <input
              id="website_url"
              name="website_url"
              type="url"
              placeholder="https://example.co.nz"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
            <p className="text-xs text-gray-500">
              Optional. Used for venue cards and as fallback for deals/happy hours.
            </p>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="region">
              Region *
            </label>
            <select
              id="region"
              name="region"
              required
              defaultValue="queenstown"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="queenstown">Queenstown</option>
              <option value="wanaka">Wanaka</option>
              <option value="dunedin">Dunedin</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-xl bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
            >
              Create Venue
            </button>
            <a
              href="/admin/venues"
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

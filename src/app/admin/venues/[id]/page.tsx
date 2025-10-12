import AdminHeader from "@/components/admin/AdminHeader";
import {
  getSupabaseServerComponentClient,
  getSupabaseServerActionClient,
} from "@/lib/supabaseClients";
import { revalidatePath } from "next/cache";
import { redirect, notFound } from "next/navigation";

type PageProps = { params: { id: string } };

export const dynamic = "force-dynamic";

async function getVenue(id: string) {
  const supabase = getSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("venues")
    .select("id, name, address, website_url")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export default async function EditVenuePage({ params }: PageProps) {
  const v = await getVenue(params.id).catch(() => null);
  if (!v) return notFound();

  // 🔹 Server Action: update venue
  async function updateVenue(formData: FormData) {
    "use server";
    const supabase = getSupabaseServerActionClient();
    const id = String(formData.get("id"));
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim() || null,
      website_url: String(formData.get("website_url") ?? "").trim() || null,
    };

    const { error } = await supabase.from("venues").update(payload).eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/venues");
    redirect("/admin/venues");
  }

  return (
    <section className="space-y-4">
      <AdminHeader
        title="Edit Venue"
        subtitle={v.name}
        ctaHref="/admin/venues"
        ctaLabel="Back to List"
      />

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <form action={updateVenue} className="space-y-6">
          <input type="hidden" name="id" value={v.id} />

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="name">
              Name *
            </label>
            <input
              id="name"
              name="name"
              defaultValue={v.name ?? ""}
              required
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
              defaultValue={v.address ?? ""}
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
              defaultValue={v.website_url ?? ""}
              placeholder="https://example.co.nz"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
            <p className="text-xs text-gray-500">
              Optional. Used for venue cards and as fallback for deals/happy hours.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-xl bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
            >
              Save Changes
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

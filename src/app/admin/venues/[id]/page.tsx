import { requireAdmin } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function EditVenuePage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const { supabase } = await requireAdmin();
  const { data: venue, error } = await supabase
    .from("venues")
    .select("id, name, address, website_url")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Load venue error:", error);
    notFound();
  }
  if (!venue) notFound();

  async function updateVenue(formData: FormData) {
    "use server";
    const { supabase } = await requireAdmin();
    const payload = {
      name: (formData.get("name") as string)?.trim(),
      address: (formData.get("address") as string)?.trim() || null,
      website_url: (formData.get("website_url") as string)?.trim() || null,
    };
    const { error } = await supabase.from("venues").update(payload).eq("id", id);
    if (error) {
      console.error("Update venue error:", error);
      throw new Error(error.message);
    }
    redirect("/admin/venues");
  }

  return (
    <main className="p-6 max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Venue</h1>
        <Link href="/admin/venues" className="text-sm text-gray-600 hover:underline">
          Back
        </Link>
      </div>

      <form action={updateVenue} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input name="name" defaultValue={venue.name ?? ""} required className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input name="address" defaultValue={venue.address ?? ""} className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Website URL</label>
          <input name="website_url" defaultValue={venue.website_url ?? ""} type="url" className="w-full rounded border px-3 py-2" />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="rounded bg-orange-500 text-white px-4 py-2 hover:bg-orange-600">
            Save Changes
          </button>
          <Link href="/admin/venues" className="rounded border px-4 py-2 hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}

import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NewVenuePage() {
  await requireAdmin();

  async function createVenue(formData: FormData) {
    "use server";
    const { supabase } = await requireAdmin();
    const payload = {
      name: (formData.get("name") as string)?.trim(),
      address: (formData.get("address") as string)?.trim() || null,
      website_url: (formData.get("website_url") as string)?.trim() || null,
    };
    const { error } = await supabase.from("venues").insert(payload);
    if (error) {
      console.error("Create venue error:", error);
      throw new Error(error.message);
    }
    redirect("/admin/venues");
  }

  return (
    <main className="p-6 max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Add Venue</h1>
        <Link href="/admin/venues" className="text-sm text-gray-600 hover:underline">
          Back
        </Link>
      </div>

      <form action={createVenue} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            name="name"
            required
            className="w-full rounded border px-3 py-2"
            placeholder="e.g. Atlas Beer Café"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            name="address"
            className="w-full rounded border px-3 py-2"
            placeholder="e.g. Steamer Wharf, Queenstown"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Website URL</label>
          <input
            name="website_url"
            type="url"
            className="w-full rounded border px-3 py-2"
            placeholder="e.g. https://example.com"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded bg-orange-500 text-white px-4 py-2 hover:bg-orange-600"
          >
            Save Venue
          </button>
          <Link href="/admin/venues" className="rounded border px-4 py-2 hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}

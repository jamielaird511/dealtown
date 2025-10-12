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

async function getVenuesSafe(): Promise<{ rows: any[]; errorMsg?: string }> {
  const supabase = getSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("venues")
    .select("id, name, address, website_url, active")
    .order("name");

  if (error) {
    console.error("getVenues error:", {
      code: (error as any).code,
      message: (error as any).message,
      details: (error as any).details,
      hint: (error as any).hint,
    });
    return { rows: [], errorMsg: toMsg(error, "Failed to load venues") };
  }
  return { rows: data ?? [] };
}

// Actions (keep as you had them; showing final forms)
export async function toggleVenueActive(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const next = String(formData.get("next")) === "true";
  const supabase = getSupabaseServerActionClient();

  try {
    const { error } = await supabase.from("venues").update({ active: next }).eq("id", id);
    if (error) {
      console.error("toggleVenueActive error:", error);
      throw new Error(toMsg(error, "Failed to update venue status"));
    }
  } catch (e: any) {
    revalidatePath("/admin/venues");
    redirect(`/admin/venues?error=${encodeURIComponent(toMsg(e))}`);
  }
  
  revalidatePath("/admin/venues");
}

export async function deleteVenue(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const supabase = getSupabaseServerActionClient();

  try {
    const { error } = await supabase.from("venues").delete().eq("id", id);
    if (error) {
      console.error("deleteVenue error:", error);
      throw new Error(toMsg(error, "Failed to delete venue"));
    }
  } catch (e: any) {
    revalidatePath("/admin/venues");
    redirect(`/admin/venues?error=${encodeURIComponent(toMsg(e))}`);
  }
  
  revalidatePath("/admin/venues");
}

export default async function VenuesPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const { rows, errorMsg } = await getVenuesSafe();
  const banner = searchParams?.error ? decodeURIComponent(searchParams.error) : errorMsg;

  return (
    <section className="space-y-4">
      <AdminHeader
        title="Venues"
        subtitle="Manage venues"
        ctaHref="/admin/venues/new"
        ctaLabel="Add Venue"
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
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Address</th>
            <th className="px-4 py-3 font-medium">Website</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        }
      >
        {rows.length === 0 ? (
          <tr>
            <td className="px-4 py-6 text-gray-500" colSpan={5}>
              {banner ? "There was a problem loading venues." : "No venues yet."}
            </td>
          </tr>
        ) : (
          rows.map((v: any) => (
            <tr key={v.id} className="hover:bg-gray-50/60">
              <td className="px-4 py-3">
                <form action={toggleVenueActive}>
                  <input type="hidden" name="id" value={v.id} />
                  <input type="hidden" name="next" value={(!v.active).toString()} />
                  <button
                    type="submit"
                    className={
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 " +
                      (v.active
                        ? "bg-green-100 text-green-800 ring-green-200"
                        : "bg-gray-100 text-gray-700 ring-gray-200")
                    }
                    title={v.active ? "Click to deactivate" : "Click to activate"}
                  >
                    {v.active ? "Active" : "Inactive"}
                  </button>
                </form>
              </td>

              <td className="px-4 py-3">{v.name}</td>
              <td className="px-4 py-3">{v.address ?? "—"}</td>
              <td className="px-4 py-3">
                {v.website_url ? (
                  <a
                    className="text-blue-600 hover:underline"
                    href={v.website_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {v.website_url}
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3 text-sm">
                  <Link href={`/admin/venues/${v.id}`} className="text-blue-600 hover:underline">
                    Edit
                  </Link>
                  <form action={deleteVenue}>
                    <input type="hidden" name="id" value={v.id} />
                    <ConfirmDeleteButton message={`Delete ${v.name}?`} />
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

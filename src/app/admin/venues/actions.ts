"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerActionClient } from "@/lib/supabaseClients";

export async function toggleVenueActive(formData: FormData) {
  const id = Number(formData.get("id"));
  const next = formData.get("next") === "true";

  const supabase = getSupabaseServerActionClient();
  const { error } = await supabase.from("venues").update({ active: next }).eq("id", id);

  if (error) {
    revalidatePath("/admin/venues");
    redirect(`/admin/venues?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/admin/venues");
}

export async function deleteVenue(formData: FormData) {
  const id = Number(formData.get("id"));

  const supabase = getSupabaseServerActionClient();
  const { error } = await supabase.from("venues").delete().eq("id", id);

  if (error) {
    revalidatePath("/admin/venues");
    redirect(`/admin/venues?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/admin/venues");
}


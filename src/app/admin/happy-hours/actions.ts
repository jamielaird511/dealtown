"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerActionClient } from "@/lib/supabaseClients";

export async function toggleHappyHourActive(formData: FormData) {
  const id = String(formData.get("id"));
  const next = formData.get("next") === "true";

  const supabase = getSupabaseServerActionClient();
  const { error } = await supabase
    .from("happy_hours")
    .update({ is_active: next })
    .eq("id", id);

  if (error) {
    revalidatePath("/admin/happy-hours");
    redirect(`/admin/happy-hours?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/admin/happy-hours");
}

export async function deleteHappyHour(formData: FormData) {
  const id = String(formData.get("id"));

  const supabase = getSupabaseServerActionClient();
  const { error } = await supabase.from("happy_hours").delete().eq("id", id);

  if (error) {
    revalidatePath("/admin/happy-hours");
    redirect(`/admin/happy-hours?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/admin/happy-hours");
}


'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { getSupabaseServerActionClient } from '@/lib/supabaseClients';
import { getSupabaseServiceClient } from '@/lib/supabaseServiceClient';

const enc = (s: string) => encodeURIComponent(s);

function toMsg(err: any, fallback = 'Unknown error') {
  try {
    if (!err) return fallback;
    if (typeof err === 'string') return err;
    if (err.message) return err.message;
    return JSON.stringify(err);
  } catch {
    return fallback;
  }
}

export async function toggleHappyHourActive(id: string, next: boolean) {
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase
    .from("happy_hours")
    .update({ is_active: next })
    .eq("id", id);

  if (error) {
    throw new Error(error.message || "Failed to update happy hour");
  }
  
  // 💡 make the list refresh reliably
  revalidatePath("/admin/happy-hours");
  redirect("/admin/happy-hours");
}

export async function deleteHappyHour(formData: FormData) {
  const id = formData.get('id')?.toString();
  if (!id) redirect('/admin/happy-hours?error=' + enc('Missing id'));

  try {
    const supabase = getSupabaseServiceClient();

    const { data, error } = await supabase
      .from('happy_hours')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      redirect(
        '/admin/happy-hours?error=' +
          enc('No row deleted (not found or not permitted).')
      );
    }

    revalidatePath('/admin/happy-hours');
    redirect('/admin/happy-hours?notice=' + enc('Happy hour deleted successfully.'));
  } catch (err) {
    if (isRedirectError(err)) throw err;
    redirect('/admin/happy-hours?error=' + enc(toMsg(err)));
  }
}


import LunchForm from '@/components/admin/lunch/LunchForm';
import { getSupabaseServerComponentClient } from '@/lib/supabaseClients';

export default async function NewLunchPage() {
  const supabase = getSupabaseServerComponentClient();
  const { data: venues } = await supabase.from('venues').select('id,name').order('name');

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold">New Lunch Special</h1>
      <LunchForm
        venues={venues ?? []}
        submitUrl="/api/lunch"
        method="POST"
      />
    </div>
  );
}
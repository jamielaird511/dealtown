import LunchForm from '@/components/admin/lunch/LunchForm';
import { getSupabaseServerComponentClient } from '@/lib/supabaseClients';

type Props = { params: { id: string } };

export default async function EditLunchPage({ params }: Props) {
  const supabase = getSupabaseServerComponentClient();

  const [{ data: venues }, { data: lunch }] = await Promise.all([
    supabase.from('venues').select('id,name').order('name'),
    supabase.from('lunch_menus').select('*').eq('id', params.id).single(),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold">Edit Lunch Special</h1>
      <LunchForm
        initial={lunch ?? {}}
        venues={venues ?? []}
        submitUrl={`/api/lunch/${params.id}`}
        method="PATCH"
      />
    </div>
  );
}
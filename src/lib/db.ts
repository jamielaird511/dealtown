import { supabase } from '@/lib/supabaseClient';

export type Venue = {
  id: number;
  name: string;
  address?: string | null;
  active?: boolean | null;
};

/**
 * Returns all active venues ordered by name.
 * We deliberately do NOT filter by category/flags to avoid missing new venues.
 */
export async function fetchAllActiveVenues(): Promise<Venue[]> {
  const { data, error } = await supabase
    .from('venues')
    .select('id,name,address,active')
    .eq('active', true)
    .order('name', { ascending: true });
  if (error) {
    console.error('fetchAllActiveVenues error', error);
    return [];
  }
  return data ?? [];
}



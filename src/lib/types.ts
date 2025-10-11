export type Deal = {
  id: number;
  title: string;
  day_of_week: string;    // 'monday'...'sunday' (lowercase)
  is_active: boolean;
  venue_name: string;
  venue_address: string;
  website_url?: string | null;
  notes?: string | null;
  price_cents?: number | null;
  created_at: string;
  updated_at: string | null;
  created_by?: string | null;
};

export type DealInput = Omit<Deal, 'id'|'created_at'|'updated_at'|'created_by'>;

export type FuelRow = {
  station_id: number;
  name: string | null;
  fuel: string;
  price_cents: number | null;
  observed_at: string | null;
};

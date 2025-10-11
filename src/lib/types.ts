export type DealKind = 'fixed' | 'percent_off' | 'amount_off' | 'bogo';

export type Deal = {
  id: number;
  title: string;
  day_of_week: string;    // 'monday'...'sunday' (lowercase)
  is_active: boolean;
  venue_name: string;
  venue_address: string;
  website_url?: string | null;
  notes?: string | null;
  kind: DealKind;
  price_cents?: number | null;
  percent_off?: number | null;
  amount_off_cents?: number | null;
  buy_qty?: number | null;
  get_qty?: number | null;
  effective_price_cents?: number | null;
  label?: string | null;
  created_at: string;
  updated_at: string | null;
  created_by?: string | null;
};

export type DealInput = Omit<Deal, 'id'|'created_at'|'updated_at'|'created_by'|'effective_price_cents'|'label'>;

export type FuelRow = {
  station_id: number;
  name: string | null;
  fuel: string;
  price_cents: number | null;
  observed_at: string | null;
};

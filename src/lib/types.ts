export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone?: string;
  website?: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  venue_id: string;
  title: string;
  description: string;
  deal_type: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  price_cents?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  venue?: Venue;
}

export interface FuelPrice {
  product: string;         // e.g. '91', '95', 'diesel'
  price_cents: number;     // integer cents
  observed_at: string;     // timestamp
  brand: string;           // BP, Z, Mobil
  venue_name: string;      // station name
  venue_suburb: string;    // suburb (Frankton, Arrowtown)
}

export interface DealSubmission {
  id: number;
  venue_name: string;
  venue_suburb?: string;
  title: string;
  description?: string;
  price_cents?: number;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  contact?: string;
  source: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}


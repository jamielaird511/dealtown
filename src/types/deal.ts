// Normalized Deal we render with: venue_id must be number|null (not string)
export type DealDto = {
  id: string | number;
  title: string;
  description?: string | null; // unified view field
  notes?: string | null;       // fallback if any legacy view returns this
  website_url?: string | null;
  price_cents?: number | null;
  day_of_week: string;
  venue_id?: string | number | null;
  venue_name?: string | null;
  venue_address?: string | null;
};

export type Deal = DealDto & {
  venue_id: number | null;
};

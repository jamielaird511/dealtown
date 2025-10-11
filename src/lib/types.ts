export type DaySlug =
  | "monday" | "tuesday" | "wednesday"
  | "thursday" | "friday" | "saturday" | "sunday";

export type Venue = { 
  id: number; 
  name: string; 
  address?: string | null; 
  website_url?: string | null; 
};

export type DealSubmission = {
  id: number;
  title: string;

  // Day slug as stored in DB, e.g. "monday"
  day_of_week: DaySlug;

  // Price stored in cents (nullable)
  price_cents: number | null;

  // Text fields
  notes?: string | null;
  description?: string | null;

  // Venue-related fields commonly present on submissions
  venue_name: string;
  venue_address?: string | null;
  venue_suburb?: string | null;
  website_url?: string | null;

  // Optional time window fields referenced by the page
  start_time?: string | null; // e.g., "16:00" or ISO time; page calls formatTime on it
  end_time?: string | null;

  // Timestamps / metadata
  created_at: string;          // ISO date-time
  submitted_by?: string | null; // email or uid if you store it
} & Record<string, unknown>;    // <-- allows any extra fields the page may read

export type Deal = {
  id: number;
  title: string;
  day_of_week: DaySlug;
  is_active: boolean;
  venue_id: number;
  venue?: Venue;
  venue_name?: string;     // For display (from joined query)
  venue_address?: string;  // For display (from joined query)
  website_url?: string | null;
  notes?: string | null;
  price_cents?: number | null;
  created_at: string;
  updated_at: string | null;
  created_by?: string | null;
};

export type DealFormInput = {
  title: string;
  day_of_week: DaySlug;
  is_active: boolean;
  price_cents?: number | null;
  notes?: string | null;
  venue_id: number;    // <- Admin selects from dropdown
};

export type FuelRow = {
  station_id: number;
  name: string | null;
  fuel: string;
  price_cents: number | null;
  observed_at: string | null;
};

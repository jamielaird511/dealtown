-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create venues table
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  deal_type TEXT NOT NULL,
  day_of_week TEXT,
  start_time TEXT,
  end_time TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create fuel_prices table
CREATE TABLE fuel_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  regular_price DECIMAL(5, 2) NOT NULL,
  premium_price DECIMAL(5, 2),
  diesel_price DECIMAL(5, 2),
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_deals_venue_id ON deals(venue_id);
CREATE INDEX idx_deals_is_active ON deals(is_active);
CREATE INDEX idx_deals_day_of_week ON deals(day_of_week);
CREATE INDEX idx_fuel_prices_city ON fuel_prices(city);
CREATE INDEX idx_fuel_prices_reported_at ON fuel_prices(reported_at);
CREATE INDEX idx_venues_city ON venues(city);
CREATE INDEX idx_venues_category ON venues(category);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update updated_at automatically
CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_prices ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on venues"
  ON venues FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on deals"
  ON deals FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on fuel_prices"
  ON fuel_prices FOR SELECT
  USING (true);

-- Note: For write access, you would typically add policies based on authenticated users
-- Example: CREATE POLICY "Allow authenticated users to insert deals"
--   ON deals FOR INSERT
--   TO authenticated
--   WITH CHECK (true);


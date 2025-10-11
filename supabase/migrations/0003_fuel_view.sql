-- Create a view for latest fuel prices with venue metadata
-- This view joins fuel_prices with venues to provide all needed display info

CREATE OR REPLACE VIEW fuel_latest_with_meta AS
SELECT 
  CASE 
    WHEN fp.regular_price IS NOT NULL THEN '91'
    WHEN fp.premium_price IS NOT NULL THEN '95'
    WHEN fp.diesel_price IS NOT NULL THEN 'diesel'
  END as product,
  CASE 
    WHEN fp.regular_price IS NOT NULL THEN ROUND(fp.regular_price * 100)::int
    WHEN fp.premium_price IS NOT NULL THEN ROUND(fp.premium_price * 100)::int
    WHEN fp.diesel_price IS NOT NULL THEN ROUND(fp.diesel_price * 100)::int
  END as price_cents,
  fp.reported_at as observed_at,
  fp.station_name as brand,
  fp.station_name as venue_name,
  fp.city as venue_suburb
FROM fuel_prices fp
WHERE fp.reported_at >= NOW() - INTERVAL '7 days'
ORDER BY fp.reported_at DESC;

-- Note: This is a simplified view using the existing fuel_prices schema.
-- In a production system, you might want to create a more normalized structure
-- with separate product rows and proper venue relationships.


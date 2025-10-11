-- Create a view that shows the best (lowest) fuel price per product
-- This aggregates across all stations to show the cheapest option for each fuel type

CREATE OR REPLACE VIEW fuel_best_by_product AS
WITH latest_prices AS (
  SELECT DISTINCT ON (product, brand, venue_name)
    product,
    price_cents,
    observed_at,
    brand,
    venue_name,
    venue_suburb
  FROM (
    -- Regular 91
    SELECT 
      '91' as product,
      ROUND(regular_price * 100)::int as price_cents,
      reported_at as observed_at,
      station_name as brand,
      station_name as venue_name,
      city as venue_suburb
    FROM fuel_prices
    WHERE regular_price IS NOT NULL
      AND reported_at >= NOW() - INTERVAL '7 days'
    
    UNION ALL
    
    -- Premium 95/98 (using premium_price)
    SELECT 
      '95' as product,
      ROUND(premium_price * 100)::int as price_cents,
      reported_at as observed_at,
      station_name as brand,
      station_name as venue_name,
      city as venue_suburb
    FROM fuel_prices
    WHERE premium_price IS NOT NULL
      AND reported_at >= NOW() - INTERVAL '7 days'
    
    UNION ALL
    
    -- Diesel
    SELECT 
      'diesel' as product,
      ROUND(diesel_price * 100)::int as price_cents,
      reported_at as observed_at,
      station_name as brand,
      station_name as venue_name,
      city as venue_suburb
    FROM fuel_prices
    WHERE diesel_price IS NOT NULL
      AND reported_at >= NOW() - INTERVAL '7 days'
  ) all_prices
  ORDER BY product, brand, venue_name, observed_at DESC
)
SELECT DISTINCT ON (product)
  product,
  price_cents,
  observed_at,
  brand,
  venue_name,
  venue_suburb
FROM latest_prices
ORDER BY product, price_cents ASC, observed_at DESC;

-- This view returns one row per fuel product type (91, 95, diesel)
-- showing the cheapest current price and where to find it


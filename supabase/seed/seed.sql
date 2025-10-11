-- Insert sample venues
INSERT INTO venues (name, address, city, state, zip_code, phone, website, category) VALUES
  ('The Happy Hour Bar', '123 Main St', 'Portland', 'OR', '97201', '503-555-0100', 'https://happyhourbar.example.com', 'Bar'),
  ('Pizza Palace', '456 Oak Ave', 'Portland', 'OR', '97202', '503-555-0101', 'https://pizzapalace.example.com', 'Restaurant'),
  ('Burger Joint', '789 Elm St', 'Portland', 'OR', '97203', '503-555-0102', 'https://burgerjoint.example.com', 'Restaurant'),
  ('The Coffee Shop', '321 Pine St', 'Portland', 'OR', '97204', '503-555-0103', 'https://coffeeshop.example.com', 'Cafe'),
  ('Taco Tuesday', '654 Maple Dr', 'Portland', 'OR', '97205', '503-555-0104', 'https://tacotuesday.example.com', 'Restaurant');

-- Insert sample deals
INSERT INTO deals (venue_id, title, description, deal_type, day_of_week, start_time, end_time, is_active) 
SELECT 
  v.id,
  'Happy Hour Special',
  'Half off all draft beers and house wines. Includes complimentary appetizers.',
  'Happy Hour',
  'Monday-Friday',
  '16:00',
  '19:00',
  true
FROM venues v WHERE v.name = 'The Happy Hour Bar';

INSERT INTO deals (venue_id, title, description, deal_type, day_of_week, start_time, end_time, is_active) 
SELECT 
  v.id,
  '2-for-1 Pizza Night',
  'Buy one large pizza, get one free! Available all day on Tuesdays.',
  'Food Special',
  'Tuesday',
  '11:00',
  '22:00',
  true
FROM venues v WHERE v.name = 'Pizza Palace';

INSERT INTO deals (venue_id, title, description, deal_type, day_of_week, start_time, end_time, is_active) 
SELECT 
  v.id,
  'Burger & Beer Combo',
  'Get any burger with a local craft beer for just $12. Available during lunch hours.',
  'Combo Deal',
  'Monday-Friday',
  '11:00',
  '14:00',
  true
FROM venues v WHERE v.name = 'Burger Joint';

INSERT INTO deals (venue_id, title, description, deal_type, day_of_week, start_time, end_time, is_active) 
SELECT 
  v.id,
  'Morning Coffee Deal',
  'Buy one coffee, get a pastry free. Perfect way to start your day!',
  'Breakfast Special',
  'Monday-Friday',
  '06:00',
  '10:00',
  true
FROM venues v WHERE v.name = 'The Coffee Shop';

INSERT INTO deals (venue_id, title, description, deal_type, day_of_week, start_time, end_time, is_active) 
SELECT 
  v.id,
  'Taco Tuesday Special',
  '$2 tacos all day! Choose from chicken, beef, or veggie options.',
  'Food Special',
  'Tuesday',
  '11:00',
  '21:00',
  true
FROM venues v WHERE v.name = 'Taco Tuesday';

INSERT INTO deals (venue_id, title, description, deal_type, day_of_week, is_active) 
SELECT 
  v.id,
  'Weekend Brunch',
  'Bottomless mimosas with any brunch entree. Live music on Sundays!',
  'Brunch Special',
  'Saturday-Sunday',
  true
FROM venues v WHERE v.name = 'The Happy Hour Bar';

-- Insert sample fuel prices
INSERT INTO fuel_prices (station_name, address, city, state, regular_price, premium_price, diesel_price, reported_at) VALUES
  ('Shell Gas Station', '100 Highway 26', 'Portland', 'OR', 3.89, 4.29, 4.15, NOW() - INTERVAL '1 hour'),
  ('Chevron', '200 Interstate Ave', 'Portland', 'OR', 3.92, 4.32, 4.18, NOW() - INTERVAL '2 hours'),
  ('Fred Meyer Fuel', '300 Market St', 'Portland', 'OR', 3.85, 4.25, 4.12, NOW() - INTERVAL '30 minutes'),
  ('Costco Gas', '400 Warehouse Way', 'Portland', 'OR', 3.79, 4.19, 4.05, NOW() - INTERVAL '15 minutes'),
  ('Arco', '500 Division St', 'Portland', 'OR', 3.82, NULL, 4.08, NOW() - INTERVAL '45 minutes');


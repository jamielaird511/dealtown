-- Make title column nullable in happy_hours table
-- This allows happy hours to be identified by venue + time window instead of requiring a separate title

ALTER TABLE public.happy_hours 
  ALTER COLUMN title DROP NOT NULL;

COMMENT ON COLUMN public.happy_hours.title IS 'Optional title. If null, display logic can use venue name + time window.';


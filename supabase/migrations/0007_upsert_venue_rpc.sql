-- Create a function to find-or-create a venue atomically
CREATE OR REPLACE FUNCTION public.upsert_venue(
  v_name TEXT,
  v_address TEXT,
  v_website_url TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  venue_id INTEGER;
BEGIN
  -- Try to find existing venue (NULL-safe comparison)
  SELECT id INTO venue_id
  FROM public.venues
  WHERE name = v_name
    AND (address = v_address OR (address IS NULL AND v_address IS NULL))
  LIMIT 1;

  -- If not found, create it
  IF venue_id IS NULL THEN
    INSERT INTO public.venues (name, address, website_url)
    VALUES (v_name, v_address, v_website_url)
    RETURNING id INTO venue_id;
  END IF;

  RETURN venue_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.upsert_venue(TEXT, TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION public.upsert_venue IS 'Find existing venue by name+address or create new one. Returns venue_id.';


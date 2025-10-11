-- Update today_active_deals view to use day_of_week column
CREATE OR REPLACE VIEW public.today_active_deals AS
SELECT *
FROM public.deals
WHERE is_active = true
  AND day_of_week = LOWER(TO_CHAR(NOW() AT TIME ZONE 'Pacific/Auckland', 'FMDay'));

-- Grant access
GRANT SELECT ON public.today_active_deals TO anon, authenticated;


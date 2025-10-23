-- Update lunch_specials view to include venue website_url
-- This adds the website_url field to the view for "Visit website" links

create or replace view public.lunch_specials as
select
  lm.id,
  lm.venue_id,
  lm.title,
  lm.description,
  
  -- Use existing price field, convert to cents for consistency
  case 
    when lm.price is not null then round(lm.price * 100)::integer
    else null
  end as price_cents,
  
  -- Use existing time fields from lunch_menus
  lm.start_time,
  lm.end_time,
  
  -- Use existing days_of_week field (already int[])
  lm.days_of_week as days,
  
  -- Use existing is_active field
  lm.is_active,

  -- venue fields the UI shows
  v.name as venue_name,
  concat_ws(', ', v.address, v.city) as venue_address,
  v.website_url as venue_website_url
from public.lunch_menus lm
join public.venues v on v.id = lm.venue_id;

-- Grant read access to all roles
grant select on public.lunch_specials to anon, authenticated, service_role;

-- Notify PostgREST to reload schema
notify pgrst, 'reload schema';

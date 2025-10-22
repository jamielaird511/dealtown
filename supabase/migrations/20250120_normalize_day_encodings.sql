-- Normalize all day encodings to 0-based convention (0=Sun, 1=Mon, ..., 6=Sat)
-- This ensures consistency between the app and admin UI

-- 1) Shift any 1–7 style arrays down to 0–6 (and change 7→0).
update public.happy_hours hh
set days = (
  select array_agg((case when d = 7 then 0 else d end) - 1 order by d)
  from unnest(hh.days) as d
)
where exists (
  select 1
  from unnest(hh.days) as d
  where d between 1 and 7
)
and not exists (
  select 1
  from unnest(hh.days) as d
  where d = 0       -- skip rows that are already 0-based
);

-- 2) Deduplicate/ sort just in case
update public.happy_hours
set days = (
  select array_agg(distinct d order by d)
  from unnest(days) d
);

-- 3) Also normalize lunch_menus.days_of_week if it exists and has similar issues
-- (This handles any existing 1-7 style encodings in lunch menus)
update public.lunch_menus lm
set days_of_week = (
  select array_agg((case when d = 7 then 0 else d end) - 1 order by d)
  from unnest(lm.days_of_week) as d
)
where days_of_week is not null
and exists (
  select 1
  from unnest(lm.days_of_week) as d
  where d between 1 and 7
)
and not exists (
  select 1
  from unnest(lm.days_of_week) as d
  where d = 0       -- skip rows that are already 0-based
);

-- 4) Deduplicate/ sort lunch_menus days_of_week
update public.lunch_menus
set days_of_week = (
  select array_agg(distinct d order by d)
  from unnest(days_of_week) d
)
where days_of_week is not null;

-- 5) Also normalize deals.day_of_week if it has numeric values
-- Convert any numeric day_of_week to 0-based array format
update public.deals
set day_of_week = (
  case 
    when day_of_week ~ '^[0-6]$' then 
      -- Already 0-based single digit, convert to array
      ('{' || day_of_week || '}')::int[]
    when day_of_week ~ '^[1-7]$' then 
      -- 1-based single digit, convert to 0-based array
      ('{' || (case when day_of_week::int = 7 then 0 else day_of_week::int - 1 end) || '}')::int[]
    else 
      -- Keep as string if it's not a simple number
      null
  end
)
where day_of_week is not null 
and day_of_week ~ '^[0-7]$';

-- Verify the normalization worked
-- This will show us the current state after normalization
select 
  'happy_hours' as table_name,
  count(*) as total_rows,
  count(case when days is not null then 1 end) as rows_with_days,
  array_agg(distinct days order by days) as unique_day_arrays
from public.happy_hours
union all
select 
  'lunch_menus' as table_name,
  count(*) as total_rows,
  count(case when days_of_week is not null then 1 end) as rows_with_days,
  array_agg(distinct days_of_week order by days_of_week) as unique_day_arrays
from public.lunch_menus
union all
select 
  'deals' as table_name,
  count(*) as total_rows,
  count(case when day_of_week is not null then 1 end) as rows_with_days,
  array_agg(distinct day_of_week order by day_of_week) as unique_day_arrays
from public.deals;

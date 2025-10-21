-- Add weekday selector and optional time window to lunch_menus
-- days_of_week: int[] -> 0=Sun,1=Mon,...,6=Sat
-- start_time/end_time: optional daily window (local venue time)
alter table public.lunch_menus
  add column if not exists days_of_week int[] default null,
  add column if not exists start_time time without time zone null,
  add column if not exists end_time   time without time zone null;

-- (Optional) simple constraint to keep ints in 0..6 if provided
create or replace function public.check_days_of_week_valid(int[])
returns boolean language sql immutable as $$
  select coalesce(array_position($1, -1),0)=0
     and coalesce(array_position($1, 7),0)=0
$$;

-- You can uncomment this if you want a table-level check:
-- alter table public.lunch_menus
--   add constraint lunch_days_valid check (days_of_week is null or public.check_days_of_week_valid(days_of_week));


-- Lunch menus live in their own table (ongoing offers; no time windows)
create table if not exists public.lunch_menus (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  title text not null,
  description text,
  price numeric(10,2),
  is_active boolean not null default true
);

-- cheap updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists trg_lunch_menus_updated_at on public.lunch_menus;
create trigger trg_lunch_menus_updated_at
before update on public.lunch_menus
for each row execute function public.set_updated_at();

-- Enable RLS and mirror a sane default:
alter table public.lunch_menus enable row level security;

-- Public can read only active rows
create policy "lunch_menus_select_active"
on public.lunch_menus
for select
to anon
using (is_active = true);

-- Authenticated users can read all (admin UI)
create policy "lunch_menus_select_auth"
on public.lunch_menus
for select
to authenticated
using (true);

-- Authenticated users can write; if you already gate admin writes elsewhere (Edge Function / service role),
-- feel free to tighten this or mirror 'deals' policies.
create policy "lunch_menus_write_auth"
on public.lunch_menus
for insert
to authenticated
with check (true);

create policy "lunch_menus_update_auth"
on public.lunch_menus
for update
to authenticated
using (true)
with check (true);

create policy "lunch_menus_delete_auth"
on public.lunch_menus
for delete
to authenticated
using (true);


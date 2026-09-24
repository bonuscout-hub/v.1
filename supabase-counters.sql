-- Bonus Scout community counters
-- Run this entire script in Supabase > SQL Editor after creating a free project.

create table if not exists public.bs_visitors (
  visitor_id text primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

create table if not exists public.bs_completions (
  visitor_id text not null,
  offer_id text not null,
  scout_value numeric not null default 0,
  completed_at timestamptz not null default now(),
  primary key (visitor_id, offer_id)
);

alter table public.bs_visitors enable row level security;
alter table public.bs_completions enable row level security;

-- Public website may register/update anonymous visitor IDs.
drop policy if exists "public can insert visitors" on public.bs_visitors;
create policy "public can insert visitors"
on public.bs_visitors for insert
to anon
with check (true);

drop policy if exists "public can update visitors" on public.bs_visitors;
create policy "public can update visitors"
on public.bs_visitors for update
to anon
using (true)
with check (true);

-- Public website needs only aggregate visitor count.
drop policy if exists "public can read visitors" on public.bs_visitors;
create policy "public can read visitors"
on public.bs_visitors for select
to anon
using (true);

-- Public website may record a completion and read community values.
drop policy if exists "public can insert completions" on public.bs_completions;
create policy "public can insert completions"
on public.bs_completions for insert
to anon
with check (true);

drop policy if exists "public can update completions" on public.bs_completions;
create policy "public can update completions"
on public.bs_completions for update
to anon
using (true)
with check (true);

drop policy if exists "public can read completions" on public.bs_completions;
create policy "public can read completions"
on public.bs_completions for select
to anon
using (true);

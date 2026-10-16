-- Victory Football Carnival – database schema
-- Run once in the Supabase SQL editor (safe to re-run).

create extension if not exists pgcrypto;

-- ── Admin allow-list ──────────────────────────────────────────────
-- Only emails listed here can edit data. Anyone else who signs in is read-only.
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

-- ── Clubs (one logo per club, shared by all its teams) ───────────
create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text not null,
  logo_url text,
  color text not null default '#1b2f7a',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ── Tournaments = one per age category ───────────────────────────
create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  segment text not null default 'mixed' check (segment in ('mixed', 'girls')),
  age_group text,
  season text not null default 'Victory Football Carnival 2026',
  event_date date,
  start_time time,
  venue text,
  match_minutes int not null default 12,
  pitches int not null default 2 check (pitches between 1 and 8),
  status text not null default 'upcoming' check (status in ('upcoming', 'live', 'closed')),
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ── Groups: a fixed number of draw slots (A1, A2, …) ─────────────
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  name text not null,
  size int not null check (size between 1 and 32),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists groups_tournament_idx on public.groups (tournament_id, sort_order);

-- ── Teams: a club's entry in one age category ────────────────────
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  club_id uuid references public.clubs (id) on delete set null,
  name text not null,
  color text not null default '#1b2f7a',
  logo_url text, -- optional override of the club logo
  group_id uuid references public.groups (id) on delete set null,
  slot int,       -- drawn position inside the group (1 = A1)
  created_at timestamptz not null default now(),
  unique (group_id, slot)
);
create index if not exists teams_tournament_idx on public.teams (tournament_id);

-- ── Matches: group games and knockouts ───────────────────────────
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  group_id uuid references public.groups (id) on delete cascade,
  stage text not null default 'group' check (stage in ('group', 'knockout')),
  round_label text,  -- e.g. "Semi-final 1", "Final"
  match_no int not null default 1,
  pitch int not null default 1,
  kickoff time,
  home_team_id uuid references public.teams (id) on delete cascade,
  away_team_id uuid references public.teams (id) on delete cascade,
  home_label text,   -- placeholder until known, e.g. "Winner A"
  away_label text,
  home_score int,
  away_score int,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'finished')),
  note text,
  created_at timestamptz not null default now(),
  check (home_team_id is null or away_team_id is null or home_team_id <> away_team_id)
);
create index if not exists matches_tournament_idx on public.matches (tournament_id, match_no, pitch);

-- Knockouts: where each side comes from ("group:<id>:1" = group winner,
-- "winner:<match id>"), penalty shoot-out score, and a shared key for two-leg ties.
alter table public.matches add column if not exists home_source text;
alter table public.matches add column if not exists away_source text;
alter table public.matches add column if not exists home_pens int;
alter table public.matches add column if not exists away_pens int;
alter table public.matches add column if not exists tie_key text;

-- Which knockout format this age group uses (see src/lib/knockout.js).
alter table public.tournaments add column if not exists ko_format text;

-- ── Row level security: public read, admin write ─────────────────
do $$
declare t text;
begin
  foreach t in array array['clubs', 'tournaments', 'groups', 'teams', 'matches'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format('create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;
grant select on public.admins to authenticated;

-- ── Realtime (live draw + scores for viewers) ────────────────────
do $$
declare t text;
begin
  foreach t in array array['clubs', 'tournaments', 'groups', 'teams', 'matches'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ── Team logos (Storage) ─────────────────────────────────────────
-- Public bucket: anyone can view logos, only admins can upload/replace/remove.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('team-logos', 'team-logos', true, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Deleting/replacing needs a select policy too, otherwise Storage reports "Access denied".
drop policy if exists "team logos admin read" on storage.objects;
create policy "team logos admin read" on storage.objects for select to authenticated
  using (bucket_id = 'team-logos' and public.is_admin());
drop policy if exists "team logos admin insert" on storage.objects;
create policy "team logos admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'team-logos' and public.is_admin());
drop policy if exists "team logos admin update" on storage.objects;
create policy "team logos admin update" on storage.objects for update to authenticated
  using (bucket_id = 'team-logos' and public.is_admin());
drop policy if exists "team logos admin delete" on storage.objects;
create policy "team logos admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'team-logos' and public.is_admin());

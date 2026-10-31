-- Kibbutz app (app.kneapps.fyi): users and permissions. Every object uses the kne_ prefix.
-- Applied 2026-10-31 as migration kne_auth.

-- One row per person who signed in to THIS app (the auth users table is shared with other apps).
create table public.kne_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'blocked')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references auth.users (id)
);
comment on table public.kne_profiles is 'kne app: people who signed in to the kibbutz app. New = pending until an admin approves.';

-- Who is admin of what: section = a section slug (rain, media, sport …) or '*' for the whole app.
create table public.kne_roles (
  user_id uuid not null references public.kne_profiles (id) on delete cascade,
  section text not null check (section ~ '^(\*|[a-z][a-z0-9_]*)$'),
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now(),
  primary key (user_id, section)
);
comment on table public.kne_roles is 'kne app: admin rights per section (section = slug, or * for the whole app).';

create or replace function public.kne_is_approved() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.kne_profiles where id = auth.uid() and status = 'approved');
$$;
-- Admin of a section (or of the whole app). Must also be approved, so blocking a person removes their rights.
create or replace function public.kne_is_admin(p_section text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.kne_roles r join public.kne_profiles p on p.id = r.user_id
    where r.user_id = auth.uid() and p.status = 'approved' and (r.section = p_section or r.section = '*')
  );
$$;
create or replace function public.kne_is_super() returns boolean
language sql stable security definer set search_path = '' as $$
  select public.kne_is_admin('*');
$$;
revoke execute on function public.kne_is_approved() from public, anon;
revoke execute on function public.kne_is_admin(text) from public, anon;
revoke execute on function public.kne_is_super() from public, anon;
grant execute on function public.kne_is_approved() to authenticated;
grant execute on function public.kne_is_admin(text) to authenticated;
grant execute on function public.kne_is_super() to authenticated;

alter table public.kne_profiles enable row level security;
alter table public.kne_roles enable row level security;

-- Profiles: a person sees their own row and creates it once, always as pending.
create policy "kne_profiles read own" on public.kne_profiles
  for select to authenticated using (id = auth.uid());
create policy "kne_profiles create own as pending" on public.kne_profiles
  for insert to authenticated
  with check (id = auth.uid() and status = 'pending' and decided_at is null and decided_by is null);
-- App admins see everyone and approve / block.
create policy "kne_profiles read all by app admins" on public.kne_profiles
  for select to authenticated using (public.kne_is_super());
create policy "kne_profiles decided by app admins" on public.kne_profiles
  for update to authenticated using (public.kne_is_super()) with check (public.kne_is_super());

-- Roles: a person sees their own; app admins manage all.
create policy "kne_roles read own" on public.kne_roles
  for select to authenticated using (user_id = auth.uid());
create policy "kne_roles managed by app admins" on public.kne_roles
  for all to authenticated using (public.kne_is_super()) with check (public.kne_is_super());

-- Explicit Data API grants (required for new tables from 2026-10-30). RLS above decides what each person can do.
grant select, insert, update on public.kne_profiles to authenticated;
grant select, insert, update, delete on public.kne_roles to authenticated;
grant select, insert, update, delete on public.kne_profiles to service_role;
grant select, insert, update, delete on public.kne_roles to service_role;

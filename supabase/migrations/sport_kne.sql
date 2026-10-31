-- Applied 2026-10-31 as migrations sport_kne and sport_public_read.
-- Sport moves into the kibbutz app (app.kneapps.fyi/sport). Bookings and joins belong to a logged-in, approved member.
-- Only ADDS things: the old public read/write policies ("Allow public read/write on sport_*") stay until the
-- switch-over, then Dor drops them in the dashboard SQL editor:
--   drop policy "Allow public read/write on sport_court_bookings" on public.sport_court_bookings;
--   drop policy "Allow public read/write on sport_booking_participants" on public.sport_booking_participants;

alter table public.sport_court_bookings add column if not exists booker_id uuid references auth.users (id) on delete set null;
alter table public.sport_booking_participants add column if not exists user_id uuid references auth.users (id) on delete cascade;
create unique index if not exists sport_booking_participants_one_per_member
  on public.sport_booking_participants (booking_id, user_id) where user_id is not null;

create policy "sport bookings: public read" on public.sport_court_bookings for select to anon, authenticated using (true);
create policy "sport participants: public read" on public.sport_booking_participants for select to anon, authenticated using (true);

create policy "sport bookings: members create own" on public.sport_court_bookings
  for insert to authenticated with check (public.kne_is_approved() and booker_id = auth.uid());
create policy "sport bookings: owner or sport admin updates" on public.sport_court_bookings
  for update to authenticated
  using (booker_id = auth.uid() or public.kne_is_admin('sport'))
  with check (public.kne_is_admin('sport') or (booker_id = auth.uid() and public.kne_is_approved()));
create policy "sport bookings: owner or sport admin deletes" on public.sport_court_bookings
  for delete to authenticated using (booker_id = auth.uid() or public.kne_is_admin('sport'));

create policy "sport participants: members join themselves" on public.sport_booking_participants
  for insert to authenticated with check (public.kne_is_approved() and user_id = auth.uid());
create policy "sport participants: self, booker or sport admin removes" on public.sport_booking_participants
  for delete to authenticated using (
    user_id = auth.uid() or public.kne_is_admin('sport')
    or exists (select 1 from public.sport_court_bookings b where b.id = booking_id and b.booker_id = auth.uid())
  );

-- Triggers: sport_no_overlap (no overlapping bookings on the same court, error 'sport_overlap') and
-- sport_capacity (joining only when registration is on and not full: 'sport_no_registration' / 'sport_full').
-- Full function bodies: see the migration in Supabase (list_migrations → sport_kne).

-- Applied 2026-10-31 as migration sport_close_public_write (the switch-over):
drop policy "Allow public read/write on sport_court_bookings" on public.sport_court_bookings;
drop policy "Allow public read/write on sport_booking_participants" on public.sport_booking_participants;

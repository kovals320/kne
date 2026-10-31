-- Applied 2026-10-31 as migration rain_kne_admins.
-- The rain section moved into the kibbutz app (app.kneapps.fyi): its admins come from kne_roles.
-- Added alongside the old rain_members policy, so the old site keeps working until it redirects.
create policy "rain_daily managed by kne rain admins" on public.rain_daily
  for all to authenticated using (public.kne_is_admin('rain')) with check (public.kne_is_admin('rain'));

-- Media moves into the kibbutz app (app.kneapps.fyi/media).
-- Media admins there are kne_is_admin('media') (kne_roles section 'media' or '*').
-- Added NEXT TO the old kmedia_is_admin() policies, so media.kneapps.fyi keeps working until it redirects.
create policy "kmedia_playlists managed by kne media admins" on public.kmedia_playlists
  for all to authenticated using (public.kne_is_admin('media')) with check (public.kne_is_admin('media'));
create policy "kmedia_video_titles managed by kne media admins" on public.kmedia_video_titles
  for all to authenticated using (public.kne_is_admin('media')) with check (public.kne_is_admin('media'));
create policy "kmedia_settings managed by kne media admins" on public.kmedia_settings
  for all to authenticated using (public.kne_is_admin('media')) with check (public.kne_is_admin('media'));

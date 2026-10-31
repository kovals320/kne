# ניר אליהו – the kibbutz app (`app.kneapps.fyi`)

A record of the project, so a new conversation (or a new person) can continue without the original chat.

> **Starting a new conversation with this file:** read sections 8 (how Dor likes to work), 7 (gotchas), 2 (decisions)
> and 6 (status). Code: public repo `kovals320/kne`. The older separate apps are `kovals320/rain`, `kovals320/kmedia`
> and `kovals320/sport`; each has (or had) its own conversation and SETUP.md.

## 1. What it is

One app for Kibbutz Nir Eliyahu (Hebrew, right-to-left, mobile-first, installable on phones) that holds several
**sections**. It starts with the three apps built earlier as separate sites, and new sections are added over time:

| Section | Today | In this app |
|---|---|---|
| משקעים (rain) | `rain.kneapps.fyi`, repo `rain`, Next.js, tables `rain_` | `/rain` |
| מדיה (media) | `media.kneapps.fyi`, repo `kmedia`, Next.js + Immich + YouTube, tables `kmedia_` | `/media` |
| מגרשי ספורט (sport) | `sport.kneapps.fyi`, repo `sport`, one plain `index.html`, tables `sport_` | `/sport` (rewritten) |

## 2. Decisions (2026-10-31, with Dor)

- **One app with sections**, not a hub of links: one domain, one repo, one installable app, one login.
- **Address:** `app.kneapps.fyi`. **Name:** "ניר אליהו".
- **Open to view, login to act.** Rain and media stay public (shareable by link). Booking a court, and any future
  members-only section, need a member login.
- **Login with Google only** (an email link can be added later for people without Google).
- **Self-registration with admin approval:** a new user signs in with Google and waits; an admin approves in the app.
- **Permissions per section:** e.g. Dor = admin of everything, someone else = admin of sport only.
- **Table prefix `kne_` for everything new in this app** (Dor's rule, as in every app): shared tables
  (`kne_profiles`, `kne_roles` …) and future sections too, as `kne_<section>_…` (e.g. `kne_events_…`).
  The existing `rain_`, `kmedia_`, `sport_` tables keep their names and rows (the old sites use them until each
  section moves in).
- **Move one section at a time**, old sites keep running until their section is ready, then the old address redirects
  to the new path (old links keep working).
- **Sport gets a security fix when it moves:** today anyone can change or delete any booking, even straight through the
  database (`sport_*` policies allow public read/write). In the new app a booking belongs to the logged-in member who made
  it; only they or a sport admin can change it.

## 3. Architecture

```
src/
  app/
    layout.tsx              root: html, font (Rubik), install banner, Vercel Analytics
    (site)/page.tsx         home: a tile per section
    (site)/<slug>/…         each section's pages (from step 5 on)
    manifest.ts robots.ts   installable app, hidden from search engines
  core/                     shared by all sections, written once
    modules.ts              THE SECTION LIST: name, short name, path, icon, accent colour, on/off
    ui/Frame.tsx            header + desktop menu + phone tab bar + home tiles
    ui/Icon.tsx             section icons
    ui/InstallPrompt.tsx    "install as an app" banner (Android button / iPhone instructions)
    supabase/               client.ts (browser), server.ts, proxy.ts (keeps the session fresh; used by src/proxy.ts)
    auth.ts                 getViewer() / requireMember() / requireAdmin(section) / requireSuper()
    ui/UserMenu.tsx         sign-in button or the person's menu (checked in the browser), pending-count badge for app admins
  modules/<slug>/           a section's own code (data loading, components), so sections don't touch each other
```

**Home page = "what's new" (2026-10-31, Dor's request):** the phone tab bar already lists the sections, so the home
page doesn't repeat them as plain tiles; it shows one card per section with a live summary
(`src/modules/<slug>/Summary.tsx`, registered in `src/modules/summaries.tsx`; a section without one shows its
description). Rain: last measurement + season vs average to date. Sport: today's bookings that haven't ended
(cached 1 minute, tag `sport`, cleared by booking actions). Media: text (a photo of the day once media moves in).
**Open design question:** the phone tab bar fits about 4–5 items. With more sections, rethink it (e.g. a "עוד" tab
or only the most-used sections in the bar) — Dor wants to decide this together when it comes up.

**Adding a section:** a folder `src/app/(site)/<slug>`, its code in `src/modules/<slug>`, one entry in
`src/core/modules.ts`, and tables with a new prefix (plus explicit grants, see section 7). The home tile, the menus
and the phone tab bar update themselves. While a section still lives in its old site, its entry's `href` is the old
full URL (the tile just links there).

**Look:** warm paper background, dark green-grey text, field-green brand (`--color-brand` #2f5f3a); each section has its
own accent colour in `modules.ts` (rain blue, media clay, sport amber). Tokens in `src/app/globals.css`. Base text 18px.
App icon: a sun over fields on green (`public/icons/`, drawn from the same shapes as the header logo).

**Speed (lesson from kmedia):** functions run in Frankfurt next to Supabase (`vercel.json` → `regions: ["fra1"]`);
public pages should stay cacheable, so "who is signed in" is checked in the browser for the frame, and on the server only
where it matters (admin pages, actions).

**Users and permissions:** `kne_profiles` (status pending → approved / blocked) and `kne_roles` (section slug or `*`).
Database functions for policies: `kne_is_approved()`, `kne_is_admin('<section>')` (true for that section's admins and
for `*`), `kne_is_super()`. A blocked person loses admin rights automatically. App admins (`*`) approve people on
`/admin/users`; a person can never block themselves or remove their own `*`. Make someone an app admin by SQL:
`insert into kne_roles (user_id, section) select id, '*' from kne_profiles where email = '...';`

## 4. Accounts and where things live

| Service | What | Notes |
|---|---|---|
| GitHub | `kovals320/kne` | Vercel deploys every push to `main` |
| Vercel | team "Apps" (`apps-2265`), project `kne` (step 4) | Claude's Vercel connector gets 403 on this team: import, env vars and domain are done by Dor in the browser. Do NOT add the Supabase integration offered on import |
| Cloudflare | zone `kneapps.fyi` | `app` CNAME to Vercel (DNS only, grey cloud) (step 4) |
| Supabase | shared project `home` (`pjujibzoscawmstarerz`, eu-central-1) | Shared with all of Dor's apps; this app's own tables use `kne_` |
| Google Cloud | OAuth client for "Sign in with Google" (step 3) | Set up by Dor in the browser; the secret goes only into Supabase |

## 5. The plan, step by step

1. ✅ Repo `kovals320/kne` created empty; this file written.
2. ✅ The frame: home with tiles, desktop menu, phone tab bar, design, installable app (manifest, icons, banner).
   Sections link to their old sites for now.
3. ✅ Login and permissions: tables `kne_profiles` (each signed-in user: name, email, status pending/approved/blocked) and
   `kne_roles` (who is admin of which section, plus a global admin), Google login in Supabase, an approval screen for
   admins, sign-in / sign-out in the frame.
4. ✅ Vercel project + `app.kneapps.fyi` (Cloudflare CNAME), env vars, Supabase redirect URL.
5. ✅ Move rain in as `/rain` (same tables), switch its tile to the internal path, then redirect `rain.kneapps.fyi`.
   Rain's admin rights move from `rain_members` to `kne_roles`.
6. ⏳ Move media in as `/media` (Immich + YouTube keys move to this Vercel project), then redirect `media.kneapps.fyi`.
   Code is in (2026-10-31); waiting for the three env vars, Dor's check, then the switch-over.
7. ✅ Rebuild sport as `/sport`: bookings tied to the logged-in member, new safe policies, then redirect
   `sport.kneapps.fyi`. Existing bookings are kept.

## 6. Status

**2026-10-31:** steps 1–4 done. Vercel project `kne` (2 Supabase env vars), domain `app.kneapps.fyi`, Supabase redirect
URL `https://app.kneapps.fyi/**`. Login: Google Cloud project `nir-eliyahu-app` (consent screen "ניר אליהו", published,
external), OAuth web client with origin `https://app.kneapps.fyi` and redirect URI
`https://pjujibzoscawmstarerz.supabase.co/auth/v1/callback`; Supabase Google provider enabled, sign-ups allowed.
Code: `/login` (Google), `/auth/callback` (creates the `kne_profiles` row as pending on the first visit), `/pending`,
`/admin/users` (app admins: approve / reject / block, admin rights per section). Dor signed in as dorhorwitz@gmail.com and was made
approved + `*` admin via SQL.
Rain moved in (2026-10-31): `src/modules/rain/` (data.ts = reads `rain_daily`, cached with tag `rain`; seasons.ts;
Hero.tsx; ui.tsx = the section's title and tabs inside the frame) and pages under `src/app/(site)/rain/`
(home, about, daily, monthly, admin). Rain admins = `kne_is_admin('rain')` (migration `rain_kne_admins` added a policy
next to the old `rain_members` one, so the old site still works). Local test data: `RAIN_FIXTURE=…json`.
Dor checked it; `rain.kneapps.fyi` now forwards to `app.kneapps.fyi/rain` (`next.config.ts` redirects in the rain repo, which only does that now). 
Sport rebuilt (2026-10-31) at `/sport` (`src/app/(site)/sport/`: page.tsx, SportApp.tsx = calendar + day list +
booking form, actions.ts; `src/modules/sport/types.ts`). Same tables `sport_court_bookings` / `sport_booking_participants`,
new columns `booker_id` / `user_id`. Anyone views; approved members book in their own name (name from their profile) and
join / leave games; the booker or a sport admin edits, deletes and removes participants. Old bookings (no `booker_id`)
can be changed only by sport admins. Database triggers block overlapping bookings and over-full games.
Switched over after Dor's check: old public read/write policies dropped (migration `sport_close_public_write`), tile
points to `/sport`, `sport.kneapps.fyi` forwards here (`vercel.json` in the sport repo).
Media moved in (2026-10-31, code only): pages under `src/app/(site)/media/` (home with the photos/videos tiles,
photos by year, people, videos, admin), helpers in `src/modules/media/` (immich.ts, youtube.ts, settings.ts, sort.ts,
search.ts, useOverlay.ts, BackLink, AdminLink = "ניהול" checked in the browser), image proxies `/api/media/photo/…`
and `/api/media/person/…` (keep the Immich key on the server; excluded from the session proxy), `/api/media/health`.
Same tables `kmedia_playlists` / `kmedia_video_titles` / `kmedia_settings` and cache tags (`youtube`, `immich`,
`kmedia-settings`, `kmedia-videos-db`). Media admins = `kne_is_admin('media')` (migration `kmedia_kne_admins`, next to
the old `kmedia_is_admin()` policies; `kmedia_members` is no longer used by this app). Colours `sun`/`lake`/`print` and
`font-display` (= Rubik bold) added to `globals.css`. Home card: a year's cover photo (changes daily) + photo count.
**Needs on Vercel → kne → Settings → Environment Variables:** `YOUTUBE_API_KEY`, `IMMICH_URL`
(`https://photos.kneapps.fyi`), `IMMICH_API_KEY` (same values as the kmedia project; keys as "Sensitive"), then a
redeploy (photos pages are pre-built at deploy time, so the build must see the keys). Check: `/api/media/health`,
`/media`. **Switch-over after Dor's check:** `href: "/media"` in `modules.ts`; `media.kneapps.fyi` forwards via
redirects in the kmedia repo (needs push access to `kovals320/kmedia`), like rain.

## 7. Gotchas (shared with the other apps)

- Supabase `home` prefixes in use: `home_`, `sport_`, `sec_`, `shirim3_`, `media_`, `kmedia_`, `rain_`, `rnb_`, `kne_`.
- **From 2026-10-30 Supabase no longer grants Data API access to new `public` tables automatically.** Every new table
  needs explicit grants in the same migration, or the app gets "permission denied":
  `grant select on public.X to anon; grant select, insert, update, delete on public.X to authenticated, service_role;`
  RLS still decides who can see/do what.
- Never change the Supabase Site URL (shared project); each app adds its own Redirect URL.
- Claude cannot create GitHub repos; Dor creates them empty, Claude attaches with push access.
- Vercel connector: used to get 403 on team Apps; since 2026-10-31 it can read the team (deployments, projects). Use it to
  check deploys (`list_deployments`, slug `apps-2265`). Env vars / domains still via Dor unless the connector allows it.
- The sites block crawlers, so Claude can't fetch them; Dor opens a page and reports.
- Destructive SQL through the Supabase connector: dropping tables was cancelled; dropping policies worked (2026-10-31).
  If a statement is cancelled, Dor runs it in the dashboard SQL editor.
- Google Fonts are blocked in Claude's sandbox: for a local `next build`, stub the Rubik font in `layout.tsx`
  temporarily (never commit the stub). Playwright + Chromium work for screenshots (`/opt/pw-browsers`).
- Next.js 16: the `middleware` file is now `proxy.ts` (see `node_modules/next/dist/docs/…/proxy.md`).
- Hebrew text with number ranges can display reversed: wrap ranges like `1968–2021` in `dir="ltr"`.
- Keys and passwords never go in the chat.

## 8. Working preferences of the owner (Dor)

- Writes in Hebrew; **replies in English**.
- Setup work: one step at a time, explained, wait for confirmation.
- App features: build the whole thing and report when done.
- Every table gets its section's prefix.

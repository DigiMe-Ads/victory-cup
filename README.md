# Victory Football Carnival 2026

Tournament site for the Victory Football Carnival (Victory Football School), 31 October 2026 at Police Park Grounds.
React + Vite + Tailwind v4 + Motion, with Supabase for data, auth and live updates.

- **Public:** `/` shows the event and every age group, split into **Boys & Girls Mixed** (U10, U12, U14, U16) and **Girls Only** (U14, U16). `/t/<slug>` shows that age group's **Groups** (slots fill in live during the draw, then turn into tables), **Knockouts**, **Fixtures** and **Teams**.
- **Admin:** sign in at `/login`. `/admin` lists the age groups and has a **Clubs & logos** tab. `/admin/t/<slug>` has six tabs: **Teams**, **Groups & draw**, **Group fixtures**, **Knockouts**, **Live scores** and **Group tables**.

## Run locally

```bash
npm install
npm run dev
```

`.env` needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`).

## Database

`supabase/schema.sql` creates `clubs`, `tournaments` (one per age group), `groups`, `teams`, `matches` and `admins`, the security rules, live updates and the `team-logos` storage bucket.
`supabase/seed.sql` adds the 10 clubs (logos in `public/logos`), the 6 age groups and the confirmed teams from the organiser's sheet.
Both are applied to the project and are safe to run again.

Security: anyone can **read**. Only emails listed in `public.admins` can **write**. The admin login is in `admin-login.local` (not committed).

### Adding another admin

1. Supabase dashboard → Authentication → Users → **Add user** (tick "Auto confirm").
2. SQL editor: `insert into public.admins (email) values ('name@example.com');`
3. Recommended: Authentication → Sign In / Providers → turn off **Allow new users to sign up**.

## Draw-day workflow

1. **Teams:** check the confirmed teams. Each team belongs to a club (for the logo) and has its own **colour**, shown as a ring around the logo, so e.g. Kickerz A–D are easy to tell apart. A team can also get its own logo. Add a late entry (e.g. the possible 3rd U16 girls team) with **Add a team**. For a club that isn't listed yet, choose **+ New club / school…**, type its name and upload its badge; the club is saved too, so it can be picked in other age groups.
2. **Groups & draw:** pick the number of groups and the size of each one (uneven groups, or one big group, are fine). Then record the physical draw: click the team that came out, then the slot it was drawn into (A1, B3, …), or the slot first and then the team. Slots can be filled in any order. Click a placed team to move it, or ✕ to send it back to the pot. The public page updates live.
3. **Group fixtures:** **Generate group fixtures** makes a round-robin inside each group (slot 1 v 2 first), spread across the pitches set under **Details**, with rests between games where possible. Every match number, pitch, time and team can be edited. The knockouts are added straight after the last group game. The **Knockouts** tab creates them from the tournament brief (already done for all six age groups):
   - U10, U12, U14 (2 groups): Semi 1 = Group A winner v Group B runner-up, Semi 2 = Group B winner v Group A runner-up, then the Final.
   - U16 (1 group of 7): Semi 1 = 1st v 3rd, Semi 2 = 2nd v 4th, then the Final.
   - Girls U14 (1 group of 3): Final, 1st v 2nd.
   - Girls U16: two-leg final straight from the draw (only 2 teams, no group games), decided on aggregate, then penalties. If a 3rd team confirms, add it, generate the group fixtures and recreate the knockouts as **Final (1st v 2nd)**.
   **Add extra match** adds any other one-off match.
4. **Live scores:** tap +/− for goals. The first goal marks a match **Live**; set **Full time** when it ends. Group tables update for everyone straight away.
   Use **Group games / Knockouts** at the top to switch. When a group (or semi-final) is finished, the qualified teams go into the knockout matches by themselves. **Group tables** shows the live points tables. If a knockout is ever timed before the group games end, the Knockouts tab warns you and **Fix times** moves it. A drawn knockout shows a **spot kicks** counter; a coin toss goes in the match note. If teams are level on every tie-breaker (head to head, goals scored, goals conceded) the table marks them with *, and you can pick the team who won the spot kicks yourself in the Knockouts tab (a team you pick is never overwritten).

Club logos can be replaced any time in **Admin → Clubs & logos**; every team of that club updates.

## Deploy

Run `npm run build` and upload `dist/`. SPA routing is handled by `public/_redirects` (Netlify) and `vercel.json` (Vercel).
Other hosts need a rewrite of all paths to `/index.html`. Set the two `VITE_` env vars on the host.

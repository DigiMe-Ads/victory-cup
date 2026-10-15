-- Victory Football Carnival 2026: clubs, the six age categories and the confirmed
-- teams from the organiser's sheet. Safe to re-run (skips anything that exists).

-- ── Clubs (logos live in /public/logos and can be replaced from Admin → Clubs) ──
insert into public.clubs (name, short_name, logo_url, color, sort_order)
select * from (values
  ('Victory Football School', 'Victory', '/logos/victory.png', '#1b2f7a', 1),
  ('Wycherley International School', 'Wycherley', '/logos/wycherley.png', '#1e6fd9', 2),
  ('Gateway College', 'Gateway', '/logos/gateway.png', '#9f1239', 3),
  ('Colombo Kickerz Football Academy', 'Kickerz', '/logos/kickerz.png', '#2f4aa8', 4),
  ('Lyceum International Schools', 'Lyceum', '/logos/lyceum.png', '#0e7490', 5),
  ('Stafford International School', 'Stafford', '/logos/stafford.png', '#6d28d9', 6),
  ('Colombo Roosters', 'Roosters', '/logos/roosters.png', '#dc2626', 7),
  ('Alethea International School', 'Alethea', '/logos/alethea.png', '#65a30d', 8),
  ('Football Lab', 'Football Lab', '/logos/football-lab.png', '#155e75', 9),
  ('Elizabeth Moir School', 'Elizabeth Moir', '/logos/elizabeth-moir.png', '#14b8a6', 10)
) as v(name, short_name, logo_url, color, sort_order)
where not exists (select 1 from public.clubs c where c.short_name = v.short_name);

-- ── Age categories ──
insert into public.tournaments
  (name, slug, segment, age_group, event_date, start_time, venue, match_minutes, pitches, sort_order, description)
values
  ('Under 10', 'u10-mixed', 'mixed', 'U10', '2026-10-31', '08:00', 'Police Park Grounds, Colombo', 12, 2, 1, 'Boys & girls mixed.'),
  ('Under 12', 'u12-mixed', 'mixed', 'U12', '2026-10-31', '08:00', 'Police Park Grounds, Colombo', 12, 2, 2, 'Boys & girls mixed.'),
  ('Under 14', 'u14-mixed', 'mixed', 'U14', '2026-10-31', '08:00', 'Police Park Grounds, Colombo', 12, 2, 3, 'Boys & girls mixed.'),
  ('Under 16', 'u16-mixed', 'mixed', 'U16', '2026-10-31', '08:00', 'Police Park Grounds, Colombo', 12, 2, 4, 'Boys & girls mixed.'),
  ('Under 14 Girls', 'u14-girls', 'girls', 'U14', '2026-10-31', '08:00', 'Police Park Grounds, Colombo', 12, 1, 5, 'Girls only.'),
  ('Under 16 Girls', 'u16-girls', 'girls', 'U16', '2026-10-31', '08:00', 'Police Park Grounds, Colombo', 12, 1, 6, 'Girls only. One more team may still confirm.')
on conflict (slug) do nothing;

-- ── Teams (only added to a category that has no teams yet) ──
with entries (slug, club, team, color) as (values
  -- U10 mixed (12)
  ('u10-mixed', 'Victory', 'Victory A', '#1b2f7a'),
  ('u10-mixed', 'Victory', 'Victory B', '#e3202e'),
  ('u10-mixed', 'Wycherley', 'Wycherley Colombo', '#1e6fd9'),
  ('u10-mixed', 'Gateway', 'Gateway Colombo', '#9f1239'),
  ('u10-mixed', 'Gateway', 'Gateway Negombo', '#d4a017'),
  ('u10-mixed', 'Kickerz', 'Kickerz A', '#2f4aa8'),
  ('u10-mixed', 'Kickerz', 'Kickerz B', '#f5c518'),
  ('u10-mixed', 'Kickerz', 'Kickerz C', '#16a34a'),
  ('u10-mixed', 'Kickerz', 'Kickerz D', '#f97316'),
  ('u10-mixed', 'Stafford', 'Stafford', '#6d28d9'),
  ('u10-mixed', 'Roosters', 'Roosters', '#dc2626'),
  ('u10-mixed', 'Alethea', 'Alethea', '#65a30d'),
  -- U12 mixed (11)
  ('u12-mixed', 'Victory', 'Victory A', '#1b2f7a'),
  ('u12-mixed', 'Victory', 'Victory B', '#e3202e'),
  ('u12-mixed', 'Wycherley', 'Wycherley Colombo', '#1e6fd9'),
  ('u12-mixed', 'Wycherley', 'Wycherley Dehiwela', '#38bdf8'),
  ('u12-mixed', 'Gateway', 'Gateway Negombo', '#d4a017'),
  ('u12-mixed', 'Kickerz', 'Kickerz A', '#2f4aa8'),
  ('u12-mixed', 'Kickerz', 'Kickerz B', '#f5c518'),
  ('u12-mixed', 'Kickerz', 'Kickerz C', '#16a34a'),
  ('u12-mixed', 'Kickerz', 'Kickerz D', '#f97316'),
  ('u12-mixed', 'Football Lab', 'Football Lab A', '#155e75'),
  ('u12-mixed', 'Football Lab', 'Football Lab B', '#22d3ee'),
  -- U14 mixed (11)
  ('u14-mixed', 'Victory', 'Victory A', '#1b2f7a'),
  ('u14-mixed', 'Victory', 'Victory B', '#e3202e'),
  ('u14-mixed', 'Wycherley', 'Wycherley Colombo', '#1e6fd9'),
  ('u14-mixed', 'Wycherley', 'Wycherley Dehiwela', '#38bdf8'),
  ('u14-mixed', 'Gateway', 'Gateway Colombo', '#9f1239'),
  ('u14-mixed', 'Gateway', 'Gateway Negombo', '#d4a017'),
  ('u14-mixed', 'Kickerz', 'Kickerz A', '#2f4aa8'),
  ('u14-mixed', 'Kickerz', 'Kickerz B', '#f5c518'),
  ('u14-mixed', 'Stafford', 'Stafford', '#6d28d9'),
  ('u14-mixed', 'Alethea', 'Alethea', '#65a30d'),
  ('u14-mixed', 'Elizabeth Moir', 'Elizabeth Moir', '#14b8a6'),
  -- U16 mixed (7)
  ('u16-mixed', 'Victory', 'Victory', '#1b2f7a'),
  ('u16-mixed', 'Wycherley', 'Wycherley Colombo', '#1e6fd9'),
  ('u16-mixed', 'Wycherley', 'Wycherley Dehiwela', '#38bdf8'),
  ('u16-mixed', 'Lyceum', 'Lyceum Nugegoda', '#0e7490'),
  ('u16-mixed', 'Stafford', 'Stafford', '#6d28d9'),
  ('u16-mixed', 'Football Lab', 'Football Lab', '#155e75'),
  ('u16-mixed', 'Elizabeth Moir', 'Elizabeth Moir', '#14b8a6'),
  -- U14 girls (3)
  ('u14-girls', 'Kickerz', 'Kickerz A', '#2f4aa8'),
  ('u14-girls', 'Kickerz', 'Kickerz B', '#f5c518'),
  ('u14-girls', 'Stafford', 'Stafford', '#6d28d9'),
  -- U16 girls (2, maybe 3)
  ('u16-girls', 'Stafford', 'Stafford', '#6d28d9'),
  ('u16-girls', 'Elizabeth Moir', 'Elizabeth Moir', '#14b8a6')
)
insert into public.teams (tournament_id, club_id, name, color)
select t.id, c.id, e.team, e.color
from entries e
join public.tournaments t on t.slug = e.slug
join public.clubs c on c.short_name = e.club
where not exists (select 1 from public.teams x where x.tournament_id = t.id);

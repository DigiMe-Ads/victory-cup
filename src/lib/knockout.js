// Knockout stages from the tournament brief, and working out who qualifies.
import { computeStandings } from './standings'
import { teamsInGroup } from './draw'

export const KO_FORMATS = {
  'cross-semis': {
    label: 'Semi-finals + Final (2 groups)',
    help: 'Top 2 of each group. Semi 1: Group A winner v Group B runner-up. Semi 2: Group B winner v Group A runner-up.',
    qualify: 'Top 2 in each group reach the semi-finals',
    count: 2,
  },
  'top4-semis': {
    label: 'Semi-finals + Final (top 4 of one group)',
    help: 'Top 4 of the group. Semi 1: 1st v 3rd. Semi 2: 2nd v 4th.',
    qualify: 'Top 4 reach the semi-finals',
    count: 4,
  },
  final: {
    label: 'Final (1st v 2nd)',
    help: 'The top 2 of the group meet in the final.',
    qualify: 'Top 2 meet in the final',
    count: 2,
  },
  'two-leg-final': {
    label: 'Two-leg final (only 2 teams)',
    help: 'Only 2 teams: no group games – they play each other twice. The champion is decided on aggregate goals, then a penalty shoot-out.',
    qualify: 'Two legs, decided on aggregate',
    count: 2,
  },
}

// Sensible format for a category's groups (matches the brief for every age group).
export function defaultFormat(groups, teamCount) {
  if (groups.length >= 2) return 'cross-semis'
  if (teamCount <= 2) return 'two-leg-final'
  if (teamCount >= 5) return 'top4-semis'
  return 'final'
}

const ORD = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
const groupSrc = (g, pos) => `group:${g.id}:${pos}`

export function positionLabel(group, pos, single) {
  if (single) return `${ORD[pos - 1]} place`
  if (pos === 1) return `Group ${group.name} winner`
  if (pos === 2) return `Group ${group.name} runner-up`
  return `Group ${group.name} ${ORD[pos - 1]}`
}

const side = (source, label) => ({ source, label })

// Round 1 of the knockout (semis, or the final itself), as [home, away] sides.
function firstRound(format, groups) {
  const single = groups.length === 1
  const [a, b] = groups
  const g = (grp, pos) => side(groupSrc(grp, pos), positionLabel(grp, pos, single))
  switch (format) {
    case 'cross-semis':
      return [
        { round: 'Semi-final 1', home: g(a, 1), away: g(b, 2) },
        { round: 'Semi-final 2', home: g(b, 1), away: g(a, 2) },
      ]
    case 'top4-semis':
      return [
        { round: 'Semi-final 1', home: g(a, 1), away: g(a, 3) },
        { round: 'Semi-final 2', home: g(a, 2), away: g(a, 4) },
      ]
    case 'final':
      return [{ round: 'Final', home: g(a, 1), away: g(a, 2) }]
    case 'two-leg-final': {
      // No group games: the two drawn teams go straight into the final.
      const t = (n) => side(`slot:${a.id}:${n}`, `Team ${n}`)
      return [
        { round: 'Final – Leg 1', home: t(1), away: t(2), tie: 'final' },
        { round: 'Final – Leg 2', home: t(2), away: t(1), tie: 'final' },
      ]
    }
    default:
      return []
  }
}

const hasFinalAfter = (format) => format === 'cross-semis' || format === 'top4-semis'

// Rows to insert. Semis go first; the final is built from their ids afterwards.
export function knockoutRows(format, tournament, groups, { startNo, kickoff }) {
  return firstRound(format, groups).map((r, i) => ({
    tournament_id: tournament.id,
    stage: 'knockout',
    round_label: r.round,
    match_no: startNo + i,
    pitch: format === 'two-leg-final' ? 1 : (i % (tournament.pitches || 1)) + 1,
    kickoff: kickoff(format === 'two-leg-final' ? i : Math.floor(i / (tournament.pitches || 1))),
    home_source: r.home.source,
    away_source: r.away.source,
    home_label: r.home.label,
    away_label: r.away.label,
    tie_key: r.tie ?? null,
  }))
}

export function finalRow(format, tournament, semis, { startNo, kickoff }) {
  if (!hasFinalAfter(format) || semis.length < 2) return null
  const [s1, s2] = [...semis].sort((x, y) => x.match_no - y.match_no)
  return {
    tournament_id: tournament.id,
    stage: 'knockout',
    round_label: 'Final',
    match_no: startNo,
    pitch: 1,
    kickoff,
    home_source: `winner:${s1.id}`,
    away_source: `winner:${s2.id}`,
    home_label: `Winner ${s1.round_label}`,
    away_label: `Winner ${s2.round_label}`,
  }
}

// ── Results ────────────────────────────────────────────────

export function groupComplete(groupId, matches) {
  const games = matches.filter((m) => m.stage === 'group' && m.group_id === groupId)
  return games.length > 0 && games.every((m) => m.status === 'finished')
}

// Aggregate for a two-leg tie (null for a normal match).
export function aggregate(match, matches) {
  if (!match.tie_key) return null
  const legs = matches
    .filter((m) => m.tie_key === match.tie_key && m.tournament_id === match.tournament_id)
    .sort((a, b) => a.match_no - b.match_no)
  const totals = new Map()
  for (const m of legs) {
    if (m.home_score == null || m.away_score == null || m.status === 'scheduled') continue
    totals.set(m.home_team_id, (totals.get(m.home_team_id) ?? 0) + m.home_score)
    totals.set(m.away_team_id, (totals.get(m.away_team_id) ?? 0) + m.away_score)
  }
  const last = legs[legs.length - 1]
  return { legs, last, isLast: last?.id === match.id, totals }
}

// Winning team id of a finished knockout match (penalties if level; two-leg ties on aggregate).
export function matchWinner(match, matches) {
  if (!match || match.status !== 'finished' || !match.home_team_id || !match.away_team_id) return null
  const agg = aggregate(match, matches)
  if (agg) {
    if (!agg.isLast || agg.legs.some((m) => m.status !== 'finished')) return null
    const h = agg.totals.get(match.home_team_id) ?? 0
    const a = agg.totals.get(match.away_team_id) ?? 0
    if (h !== a) return h > a ? match.home_team_id : match.away_team_id
  } else if (match.home_score !== match.away_score) {
    return match.home_score > match.away_score ? match.home_team_id : match.away_team_id
  }
  if (match.home_pens == null || match.away_pens == null || match.home_pens === match.away_pens) return null
  return match.home_pens > match.away_pens ? match.home_team_id : match.away_team_id
}

// Team id a knockout side should hold, once its source is decided.
export function resolveSource(source, { groups, teams, matches }) {
  if (!source) return null
  const [kind, id, pos] = source.split(':')
  if (kind === 'group') {
    if (!groups.some((g) => g.id === id) || !groupComplete(id, matches)) return null
    const table = computeStandings(teamsInGroup(teams, id), matches.filter((m) => m.group_id === id))
    return table[Number(pos) - 1]?.team.id ?? null
  }
  if (kind === 'slot') return teams.find((t) => t.group_id === id && t.slot === Number(pos))?.id ?? null
  if (kind === 'winner') return matchWinner(matches.find((m) => m.id === id), matches)
  return null
}

// Knockout sides that are now decided but still empty: [{ match, field, teamId }].
export function pendingFills(ctx) {
  const out = []
  for (const m of ctx.matches) {
    if (m.stage !== 'knockout') continue
    for (const s of ['home', 'away']) {
      if (m[`${s}_team_id`]) continue
      const teamId = resolveSource(m[`${s}_source`], ctx)
      if (teamId) out.push({ match: m, field: `${s}_team_id`, teamId })
    }
  }
  return out
}

// The champion once the last knockout match is decided.
export function champion(matches) {
  const ko = matches.filter((m) => m.stage === 'knockout')
  const final = ko.find((m) => /final/i.test(m.round_label ?? '') && !/semi/i.test(m.round_label ?? '') && (!m.tie_key || aggregate(m, matches)?.isLast))
  return final ? matchWinner(final, matches) : null
}

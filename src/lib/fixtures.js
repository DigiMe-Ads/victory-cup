// Round-robin group fixtures, packed across several pitches.
import { teamsInGroup } from './draw'

// Circle method: returns rounds of [homeId, awayId] pairs, in slot order (A1 v A2 first).
export function roundRobinRounds(teamIds) {
  const ids = [...teamIds]
  if (ids.length % 2) ids.push(null) // bye
  const n = ids.length
  const rounds = []
  for (let r = 0; r < n - 1; r++) {
    const round = []
    for (let i = 0; i < n / 2; i++) {
      const a = ids[i]
      const b = ids[n - 1 - i]
      if (a && b) round.push(r % 2 ? [b, a] : [a, b])
    }
    rounds.push(round)
    ids.splice(1, 0, ids.pop()) // rotate all but the first
  }
  return rounds
}

// Pack matches into time slots of `pitches` games. A team never plays twice in one
// slot, and we prefer giving teams a rest instead of back-to-back games.
export function packIntoSlots(items, pitches = 2) {
  const queue = [...items]
  const slots = []
  let lastPlayed = new Set()
  while (queue.length) {
    const slot = []
    const busy = new Set()
    for (const preferRest of [true, false]) {
      for (let i = 0; i < queue.length && slot.length < pitches; i++) {
        const { home, away } = queue[i]
        if (busy.has(home) || busy.has(away)) continue
        if (preferRest && (lastPlayed.has(home) || lastPlayed.has(away))) continue
        slot.push(queue.splice(i, 1)[0])
        busy.add(home).add(away)
        i--
      }
    }
    slots.push(slot)
    lastPlayed = busy
  }
  return slots
}

// All group games for a category: groups take turns round by round so every
// group progresses together. Returns rows ready to insert (without kickoff).
export function generateGroupSchedule(tournament, groups, teams, startNo = 1) {
  const perGroup = groups.map((g) => ({
    group: g,
    rounds: roundRobinRounds(teamsInGroup(teams, g.id).map((t) => t.id)),
  }))
  const maxRounds = Math.max(0, ...perGroup.map((g) => g.rounds.length))
  const ordered = []
  for (let r = 0; r < maxRounds; r++) {
    for (const { group, rounds } of perGroup) {
      for (const [home, away] of rounds[r] ?? []) ordered.push({ home, away, group_id: group.id })
    }
  }
  const slots = packIntoSlots(ordered, tournament.pitches || 1)
  let no = startNo
  return slots.flatMap((slot, i) =>
    slot.map((m, p) => ({
      tournament_id: tournament.id,
      group_id: m.group_id,
      stage: 'group',
      match_no: no++,
      pitch: p + 1,
      home_team_id: m.home,
      away_team_id: m.away,
      _slot: i + 1,
    })),
  )
}

// Time for a slot based on start time + match length + changeover.
export function slotKickoff(startTime, slot, matchMinutes, breakMinutes = 0) {
  if (!startTime) return null
  const [h, m] = startTime.split(':').map(Number)
  const total = h * 60 + m + (slot - 1) * (matchMinutes + breakMinutes)
  const hh = String(Math.floor(total / 60) % 24).padStart(2, '0')
  const mm = String(total % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

// Matches sharing a kick-off time (or the same number when no time is set).
export function groupByKickoff(matches) {
  const sorted = [...matches].sort(
    (a, b) => (a.kickoff ?? '99').localeCompare(b.kickoff ?? '99') || a.match_no - b.match_no || a.pitch - b.pitch,
  )
  const out = []
  for (const m of sorted) {
    const key = m.kickoff ?? `#${m.match_no}`
    const last = out[out.length - 1]
    if (last && last.key === key) last.matches.push(m)
    else out.push({ key, kickoff: m.kickoff, matches: [m] })
  }
  for (const g of out) g.matches.sort((a, b) => a.pitch - b.pitch || a.match_no - b.match_no)
  return out
}

// Teams appearing twice at the same kick-off (for admin warnings).
export function timeClashes(matches) {
  const clashes = new Set()
  const seen = new Map()
  for (const m of matches) {
    if (!m.kickoff) continue
    for (const t of [m.home_team_id, m.away_team_id]) {
      if (!t) continue
      const key = `${m.kickoff}:${t}`
      if (seen.has(key)) {
        clashes.add(m.id)
        clashes.add(seen.get(key))
      } else seen.set(key, m.id)
    }
  }
  return clashes
}

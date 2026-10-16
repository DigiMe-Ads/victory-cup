// Group table from finished group matches: Win 3, Draw 1, Loss 0.
// Ties (tournament brief 5.2): head to head → goals scored → goals conceded →
// 3 spot kicks (decided on the day; rows still level are flagged `level`).
export function computeStandings(teams, matches) {
  const rows = new Map(
    teams.map((t) => [
      t.id,
      { team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0, form: [], level: false },
    ]),
  )

  const finished = matches
    .filter((m) => m.stage === 'group' && m.status === 'finished' && m.home_score != null && m.away_score != null)
    .sort((a, b) => a.match_no - b.match_no)

  for (const m of finished) {
    const home = rows.get(m.home_team_id)
    const away = rows.get(m.away_team_id)
    if (!home || !away) continue
    record(home, m.home_score, m.away_score)
    record(away, m.away_score, m.home_score)
  }

  const byPoints = [...rows.values()].sort((a, b) => b.points - a.points)
  const out = []
  for (let i = 0; i < byPoints.length; ) {
    let j = i
    while (j < byPoints.length && byPoints[j].points === byPoints[i].points) j++
    out.push(...breakTie(byPoints.slice(i, j), finished))
    i = j
  }
  return out
}

function breakTie(block, finished) {
  if (block.length < 2) return block
  const h2h = headToHeadPoints(block.map((r) => r.team.id), finished)
  const key = (r) => [h2h.get(r.team.id), r.gf, -r.ga]
  const sorted = [...block].sort((a, b) => {
    const ka = key(a)
    const kb = key(b)
    for (let k = 0; k < ka.length; k++) if (ka[k] !== kb[k]) return kb[k] - ka[k]
    return (a.team.slot ?? 99) - (b.team.slot ?? 99)
  })
  // Still level on every criterion → spot kicks decide.
  for (let k = 0; k < sorted.length; k++) {
    const same = (x) => x && key(x).join() === key(sorted[k]).join() && x.played > 0
    if (same(sorted[k - 1]) || same(sorted[k + 1])) sorted[k].level = true
  }
  return sorted
}

// Points earned only in matches between the tied teams (a mini-league).
function headToHeadPoints(ids, finished) {
  const set = new Set(ids)
  const pts = new Map(ids.map((id) => [id, 0]))
  for (const m of finished) {
    if (!set.has(m.home_team_id) || !set.has(m.away_team_id)) continue
    if (m.home_score > m.away_score) pts.set(m.home_team_id, pts.get(m.home_team_id) + 3)
    else if (m.home_score < m.away_score) pts.set(m.away_team_id, pts.get(m.away_team_id) + 3)
    else {
      pts.set(m.home_team_id, pts.get(m.home_team_id) + 1)
      pts.set(m.away_team_id, pts.get(m.away_team_id) + 1)
    }
  }
  return pts
}

function record(row, scored, conceded) {
  row.played += 1
  row.gf += scored
  row.ga += conceded
  row.gd = row.gf - row.ga
  if (scored > conceded) {
    row.won += 1
    row.points += 3
    row.form.push('W')
  } else if (scored === conceded) {
    row.drawn += 1
    row.points += 1
    row.form.push('D')
  } else {
    row.lost += 1
    row.form.push('L')
  }
}

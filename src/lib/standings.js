// Group table from finished group matches: Win 3, Draw 1, Loss 0.
export function computeStandings(teams, matches) {
  const rows = new Map(
    teams.map((t) => [
      t.id,
      { team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0, form: [] },
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

  return [...rows.values()].sort(
    (a, b) =>
      b.points - a.points ||
      b.gd - a.gd ||
      b.gf - a.gf ||
      headToHead(a.team.id, b.team.id, finished) ||
      (a.team.slot ?? 99) - (b.team.slot ?? 99),
  )
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

// Negative when team a beat team b in their meeting (so a sorts first).
function headToHead(a, b, matches) {
  const m = matches.find(
    (x) => (x.home_team_id === a && x.away_team_id === b) || (x.home_team_id === b && x.away_team_id === a),
  )
  if (!m) return 0
  const aGoals = m.home_team_id === a ? m.home_score : m.away_score
  const bGoals = m.home_team_id === a ? m.away_score : m.home_score
  return bGoals - aGoals
}

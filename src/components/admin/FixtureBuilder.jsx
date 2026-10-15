import { useMemo, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Clock } from 'lucide-react'
import AdminMatchRow from './AdminMatchRow'
import FixtureToolbar from './FixtureToolbar'
import { useAction } from '../../hooks/useToast'
import { addMatches, clearMatches, deleteMatch, updateMatch } from '../../lib/api'
import { generateGroupSchedule, groupByKickoff, slotKickoff, timeClashes } from '../../lib/fixtures'
import { formatTime } from '../../lib/format'

export default function FixtureBuilder({ tournament, groups, teams, teamsById, matches, refresh }) {
  const run = useAction()
  const [breakMinutes, setBreakMinutes] = useState(2)
  const clashes = useMemo(() => timeClashes(matches), [matches])
  const pitches = tournament.pitches || 1
  const drawnTeams = teams.filter((t) => t.group_id && t.slot)
  const start = tournament.start_time?.slice(0, 5)
  const kickoffFor = (slot) => slotKickoff(start, slot, tournament.match_minutes, breakMinutes)
  const nextNo = Math.max(0, ...matches.map((m) => m.match_no)) + 1

  async function handleGenerate() {
    const pot = teams.length - drawnTeams.length
    if (pot && !confirm(`${pot} team${pot > 1 ? 's are' : ' is'} not drawn into a group yet and won't get fixtures. Continue?`)) return
    const groupGames = matches.filter((m) => m.stage === 'group')
    if (groupGames.length && !confirm(`Replace the ${groupGames.length} existing group matches (and their scores)?`)) return
    const knockouts = matches.filter((m) => m.stage === 'knockout')
    const rows = generateGroupSchedule(tournament, groups, drawnTeams).map(({ _slot, ...r }) => ({
      ...r,
      kickoff: kickoffFor(_slot),
    }))
    await run(async () => {
      if (groupGames.length) await clearMatches(tournament.id, 'group')
      if (rows.length) await addMatches(rows)
      // Keep knockouts after the group stage.
      await Promise.all(knockouts.map((m, i) => updateMatch(m.id, { match_no: rows.length + i + 1 })))
    }, `${rows.length} group matches created`)
    refresh()
  }

  // Re-time everything in match-number order: a new time slot starts whenever a
  // pitch or a team would be used twice.
  async function handleTimes() {
    const sorted = [...matches].sort((a, b) => a.match_no - b.match_no || a.pitch - b.pitch)
    let slot = 1
    let pitchesUsed = new Set()
    let teamsBusy = new Set()
    const updates = sorted.map((m) => {
      const ids = [m.home_team_id, m.away_team_id].filter(Boolean)
      if (pitchesUsed.has(m.pitch) || ids.some((id) => teamsBusy.has(id))) {
        slot += 1
        pitchesUsed = new Set()
        teamsBusy = new Set()
      }
      pitchesUsed.add(m.pitch)
      ids.forEach((id) => teamsBusy.add(id))
      return [m.id, kickoffFor(slot)]
    })
    await run(() => Promise.all(updates.map(([id, kickoff]) => updateMatch(id, { kickoff }))), 'Kick-off times updated')
    refresh()
  }

  async function handleKnockout() {
    const last = [...matches].sort((a, b) => (b.kickoff ?? '').localeCompare(a.kickoff ?? ''))[0]
    const row = {
      tournament_id: tournament.id,
      stage: 'knockout',
      round_label: 'Final',
      match_no: nextNo,
      pitch: 1,
      kickoff: last?.kickoff ? slotKickoff(last.kickoff.slice(0, 5), 2, tournament.match_minutes, breakMinutes) : null,
    }
    await run(() => addMatches([row]), 'Knockout match added – set its round and teams below')
    refresh()
  }

  async function handleClear() {
    if (!confirm('Delete every match in this category, including scores?')) return
    await run(() => clearMatches(tournament.id), 'Fixtures cleared')
    refresh()
  }

  async function handleUpdate(id, values) {
    await run(() => updateMatch(id, values))
    refresh()
  }

  async function handleDelete(m) {
    if (!confirm(`Delete match #${m.match_no}?`)) return
    await run(() => deleteMatch(m.id), 'Match deleted')
    refresh()
  }

  if (!groups.length) {
    return <p className="card p-10 text-center text-navy/50">Set up the groups and record the draw first.</p>
  }

  return (
    <div className="space-y-6">
      <FixtureToolbar
        pitches={pitches}
        canGenerate={drawnTeams.length >= 2}
        hasMatches={matches.length > 0}
        breakMinutes={breakMinutes}
        onBreakChange={setBreakMinutes}
        onGenerate={handleGenerate}
        onTimes={handleTimes}
        onKnockout={handleKnockout}
        onClear={handleClear}
      />

      {matches.length === 0 && (
        <p className="card p-8 text-center text-navy/50">No matches yet. Generate the group fixtures once the draw is done.</p>
      )}

      <div className="space-y-5">
        {groupByKickoff(matches).map(({ key, kickoff, matches: list }) => (
          <section key={key}>
            <div className="mb-2 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-navy text-white">
                <Clock className="size-4" />
              </span>
              <h4 className="heading text-xl">{kickoff ? formatTime(kickoff) : 'No time set'}</h4>
              <span className="text-sm font-semibold text-navy/40">{list.length} match{list.length > 1 ? 'es' : ''}</span>
            </div>
            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {list.map((m) => (
                  <AdminMatchRow
                    key={m.id}
                    match={m}
                    teams={teams}
                    teamsById={teamsById}
                    groups={groups}
                    pitches={pitches}
                    clash={clashes.has(m.id)}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

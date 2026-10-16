import { useMemo, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { AlertTriangle, Clock, Plus } from 'lucide-react'
import AdminMatchRow from './AdminMatchRow'
import FixtureToolbar from './FixtureToolbar'
import KnockoutSetup from './KnockoutSetup'
import Button from '../ui/Button'
import { useAction } from '../../hooks/useToast'
import { addMatches, clearMatches, deleteMatch, listMatches, saveTournament, updateMatch } from '../../lib/api'
import {
  earlyKnockouts,
  generateGroupSchedule,
  groupByKickoff,
  groupStageEnd,
  retime,
  retimeKnockouts,
  slotKickoff,
  timeClashes,
} from '../../lib/fixtures'
import { finalRow, knockoutRows } from '../../lib/knockout'
import { formatTime } from '../../lib/format'

const BREAK = 2

// stage="group": the group fixtures. stage="knockout": semis/finals.
export default function FixtureBuilder({ stage = 'group', tournament, groups, teams, teamsById, matches, refresh }) {
  const run = useAction()
  const [breakMinutes, setBreakMinutes] = useState(BREAK)
  const clashes = useMemo(() => timeClashes(matches), [matches])
  const pitches = tournament.pitches || 1
  const drawnTeams = teams.filter((t) => t.group_id && t.slot)
  const start = tournament.start_time?.slice(0, 5)
  const mins = tournament.match_minutes
  const kickoffFor = (slot) => slotKickoff(start, slot, mins, breakMinutes)
  const groupGames = matches.filter((m) => m.stage === 'group')
  const knockouts = matches.filter((m) => m.stage === 'knockout')
  const shown = stage === 'group' ? groupGames : knockouts
  const early = earlyKnockouts(matches, mins)

  // Knockouts always start once the last group game is over (or at the start time).
  async function timeKnockouts(list) {
    const from = groupStageEnd(list, mins, breakMinutes) ?? start
    await Promise.all(retimeKnockouts(list, from, mins, breakMinutes).map(([id, kickoff]) => updateMatch(id, { kickoff })))
  }

  async function handleGenerate() {
    const pot = teams.length - drawnTeams.length
    if (pot && !confirm(`${pot} team${pot > 1 ? 's are' : ' is'} not drawn into a group yet and won't get fixtures. Continue?`)) return
    if (groupGames.length && !confirm(`Replace the ${groupGames.length} existing group matches (and their scores)?`)) return
    const rows = generateGroupSchedule(tournament, groups, drawnTeams).map(({ _slot, ...r }) => ({ ...r, kickoff: kickoffFor(_slot) }))
    await run(async () => {
      if (groupGames.length) await clearMatches(tournament.id, 'group')
      if (rows.length) await addMatches(rows)
      // Keep knockouts numbered and timed after the group stage.
      const ko = [...knockouts].sort((a, b) => a.match_no - b.match_no)
      await Promise.all(ko.map((m, i) => updateMatch(m.id, { match_no: rows.length + i + 1 })))
      await timeKnockouts(await listMatches(tournament.id))
    }, `${rows.length} group matches created`)
    refresh()
  }

  async function handleTimes() {
    await run(async () => {
      await Promise.all(retime(groupGames, kickoffFor).map(([id, kickoff]) => updateMatch(id, { kickoff })))
      await timeKnockouts(await listMatches(tournament.id))
    }, 'Kick-off times updated')
    refresh()
  }

  async function handleKnockoutTimes() {
    await run(() => timeKnockouts(matches), 'Knockouts moved after the group games')
    refresh()
  }

  // Semis/final (or a final / two-leg final) exactly as in the tournament brief.
  async function handleKnockouts(format) {
    if (knockouts.length && !confirm(`Replace the ${knockouts.length} existing knockout matches (and their scores)?`)) return
    const startNo = Math.max(0, ...groupGames.map((m) => m.match_no)) + 1
    await run(async () => {
      if (knockouts.length) await clearMatches(tournament.id, 'knockout')
      const first = await addMatches(knockoutRows(format, tournament, groups, { startNo, kickoff: () => null }))
      const final = finalRow(format, tournament, first, { startNo: startNo + first.length, kickoff: null })
      if (final) await addMatches([final])
      await saveTournament({ id: tournament.id, ko_format: format })
      await timeKnockouts(await listMatches(tournament.id))
    }, 'Knockout stage created')
    refresh()
  }

  async function handleExtraMatch() {
    const row = {
      tournament_id: tournament.id,
      stage: 'knockout',
      round_label: 'Play-off',
      match_no: Math.max(0, ...matches.map((m) => m.match_no)) + 1,
      pitch: 1,
      kickoff: null,
    }
    await run(() => addMatches([row]), 'Match added – set its round, teams and time below')
    refresh()
  }

  async function handleClear() {
    const what = stage === 'group' ? 'group match' : 'knockout match'
    if (!confirm(`Delete every ${what} in this age group, including scores?`)) return
    await run(() => clearMatches(tournament.id, stage), 'Matches cleared')
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
      {stage === 'group' ? (
        <FixtureToolbar
          pitches={pitches}
          canGenerate={drawnTeams.length >= 2}
          hasMatches={groupGames.length > 0}
          breakMinutes={breakMinutes}
          onBreakChange={setBreakMinutes}
          onGenerate={handleGenerate}
          onTimes={handleTimes}
          onClear={handleClear}
        />
      ) : (
        <>
          <KnockoutSetup tournament={tournament} groups={groups} teams={teams} knockouts={knockouts} onCreate={handleKnockouts} />
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" icon={Clock} onClick={handleKnockoutTimes} disabled={!knockouts.length}>
              Time knockouts after the group games
            </Button>
            <Button variant="ghost" icon={Plus} onClick={handleExtraMatch}>
              Add extra match
            </Button>
          </div>
        </>
      )}

      {early.length > 0 && (
        <div className="card flex flex-wrap items-center gap-3 border-2 border-red/30 bg-red-soft/50 p-4">
          <AlertTriangle className="size-5 text-red" />
          <p className="min-w-52 flex-1 text-sm font-semibold">
            {early.map((m) => m.round_label).join(', ')} {early.length > 1 ? 'are' : 'is'} set to kick off before the group
            games finish ({formatTime(groupStageEnd(matches, mins))}).
          </p>
          <Button size="sm" variant="dark" onClick={handleKnockoutTimes}>
            Fix times
          </Button>
        </div>
      )}

      {shown.length === 0 && (
        <p className="card p-8 text-center text-navy/50">
          {stage === 'group'
            ? 'No group matches yet. Generate them once the draw is done.'
            : 'No knockout matches yet. Create them above.'}
        </p>
      )}

      <div className="space-y-5">
        {groupByKickoff(shown).map(({ key, kickoff, matches: list }) => (
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

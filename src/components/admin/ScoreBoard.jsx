import ScoreRow from './ScoreRow'
import { matchStageLabel } from '../tournament/MatchCard'
import { useAction } from '../../hooks/useToast'
import { updateMatch } from '../../lib/api'
import { groupByKickoff } from '../../lib/fixtures'
import { formatTime } from '../../lib/format'

export default function ScoreBoard({ teamsById, groups, groupsById, matches, setMatches, refresh }) {
  const run = useAction()
  const single = groups.length === 1

  async function handleUpdate(id, values) {
    // Optimistic: show the new score immediately, then sync.
    setMatches((list) => list.map((m) => (m.id === id ? { ...m, ...values } : m)))
    const ok = await run(() => updateMatch(id, values).then(() => true))
    if (!ok) refresh()
  }

  if (!matches.length) {
    return <p className="card p-10 text-center text-navy/50">Build the fixtures first, then enter scores here.</p>
  }

  return (
    <div className="space-y-6">
      {groupByKickoff(matches).map(({ key, kickoff, matches: list }) => (
        <section key={key}>
          <h4 className="heading mb-2 text-xl">{kickoff ? formatTime(kickoff) : 'No time set'}</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {list.map((m) => (
              <ScoreRow
                key={m.id}
                match={m}
                teamsById={teamsById}
                stageLabel={matchStageLabel(m, groupsById, single)}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

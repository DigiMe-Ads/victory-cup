import { useState } from 'react'
import ScoreRow from './ScoreRow'
import { matchStageLabel } from '../tournament/MatchCard'
import { useAction } from '../../hooks/useToast'
import { updateMatch } from '../../lib/api'
import { groupByKickoff } from '../../lib/fixtures'
import { formatTime } from '../../lib/format'
import { aggregate } from '../../lib/knockout'

export default function ScoreBoard({ teamsById, groups, groupsById, matches, setMatches, refresh }) {
  const run = useAction()
  const single = groups.length === 1
  const groupGames = matches.filter((m) => m.stage === 'group')
  const knockouts = matches.filter((m) => m.stage === 'knockout')
  const groupsDone = groupGames.length > 0 && groupGames.every((m) => m.status === 'finished')
  const [view, setView] = useState(groupsDone || !groupGames.length ? 'knockout' : 'group')
  const shown = view === 'group' ? groupGames : knockouts

  async function handleUpdate(id, values) {
    // Optimistic: show the new score immediately, then sync.
    setMatches((list) => list.map((m) => (m.id === id ? { ...m, ...values } : m)))
    const ok = await run(() => updateMatch(id, values).then(() => true))
    if (!ok) refresh()
  }

  if (!matches.length) {
    return <p className="card p-10 text-center text-navy/50">Build the fixtures first, then enter scores here.</p>
  }

  const tabs = [
    { id: 'group', label: 'Group games', done: groupGames.filter((m) => m.status === 'finished').length, total: groupGames.length },
    { id: 'knockout', label: 'Knockouts', done: knockouts.filter((m) => m.status === 'finished').length, total: knockouts.length },
  ]

  return (
    <div className="space-y-6">
      <div className="inline-flex gap-1 rounded-xl bg-white p-1.5 ring-1 ring-navy/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={`cursor-pointer rounded-lg px-4 py-2 font-cond text-base font-bold tracking-wide uppercase transition ${
              view === t.id ? 'bg-red text-white' : 'text-navy/60 hover:text-navy'
            }`}
          >
            {t.label} <span className="opacity-70">{t.done}/{t.total}</span>
          </button>
        ))}
      </div>

      {view === 'knockout' && (
        <p className="text-sm text-navy/60">
          Qualified teams go into the knockouts by themselves once their group or semi-final is finished. Teams level on every
          tie-breaker are separated by 3 spot kicks – if that changes who goes through, pick the team in the Knockouts tab.
        </p>
      )}

      {shown.length === 0 && <p className="card p-8 text-center text-navy/50">No matches here yet.</p>}

      {groupByKickoff(shown).map(({ key, kickoff, matches: list }) => (
        <section key={key}>
          <h4 className="heading mb-2 text-xl">{kickoff ? formatTime(kickoff) : 'No time set'}</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {list.map((m) => {
              const { needsPens, aggText } = knockoutState(m, matches, teamsById)
              return (
                <ScoreRow
                  key={m.id}
                  match={m}
                  teamsById={teamsById}
                  stageLabel={matchStageLabel(m, groupsById, single)}
                  needsPens={needsPens}
                  aggText={aggText}
                  onUpdate={handleUpdate}
                />
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

// Penalties are needed when a knockout ends level (for a two-leg tie: level on aggregate after leg 2).
function knockoutState(m, matches, teamsById) {
  if (m.stage !== 'knockout' || m.status === 'scheduled' || !m.home_team_id || !m.away_team_id) return {}
  const agg = aggregate(m, matches)
  if (agg) {
    if (!agg.isLast) return {}
    const h = agg.totals.get(m.home_team_id) ?? 0
    const a = agg.totals.get(m.away_team_id) ?? 0
    return {
      needsPens: h === a,
      aggText: `Aggregate: ${teamsById[m.home_team_id]?.name} ${h} – ${a} ${teamsById[m.away_team_id]?.name}`,
    }
  }
  return { needsPens: (m.home_score ?? 0) === (m.away_score ?? 0) }
}

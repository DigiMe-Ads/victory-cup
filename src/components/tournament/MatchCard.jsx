import { AnimatePresence, motion } from 'motion/react'
import TeamBadge from '../ui/TeamBadge'
import StatusBadge from '../ui/StatusBadge'
import { groupTitle } from '../../lib/draw'
import { aggregate, matchWinner } from '../../lib/knockout'

// What to call a match: "Group A", "Semi-final", …
export function matchStageLabel(match, groupsById, single) {
  if (match.stage === 'knockout') return match.round_label || 'Knockout'
  const g = groupsById[match.group_id]
  return g ? groupTitle(g, single) : 'Group stage'
}

export default function MatchCard({ match, teamsById, groupsById, single, matches = [] }) {
  const home = teamsById[match.home_team_id]
  const away = teamsById[match.away_team_id]
  const hasScore = match.home_score != null && match.away_score != null && match.status !== 'scheduled'
  const knockout = match.stage === 'knockout'
  const koWinner = knockout ? matchWinner(match, matches.length ? matches : [match]) : null
  const winner =
    match.status === 'finished' && hasScore
      ? koWinner
        ? koWinner === match.home_team_id
          ? 'home'
          : 'away'
        : match.home_score > match.away_score
          ? 'home'
          : match.away_score > match.home_score
            ? 'away'
            : 'draw'
      : null
  const pens = Boolean(knockout && match.home_pens != null && match.away_pens != null && (match.home_pens || match.away_pens))
  const agg = knockout ? aggregate(match, matches) : null
  const aggLine =
    agg?.isLast && hasScore
      ? `Aggregate ${agg.totals.get(match.home_team_id) ?? 0} – ${agg.totals.get(match.away_team_id) ?? 0}`
      : null
  const live = match.status === 'live'

  return (
    <motion.div
      layout
      className={`relative overflow-hidden rounded-2xl border-2 bg-white p-4 transition ${
        live ? 'border-red shadow-[0_0_0_5px_rgb(227_32_46/0.12)]' : 'border-navy/8'
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold">
          <span className="rounded-md bg-navy px-2 py-0.5 text-white">Pitch {match.pitch}</span>
          <span className={`rounded-md px-2 py-0.5 ${knockout ? 'bg-sun text-navy' : 'bg-ice text-navy'}`}>
            {matchStageLabel(match, groupsById, single)}
          </span>
          <span className="text-navy/40">#{match.match_no}</span>
        </span>
        <StatusBadge status={match.status} match />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Side team={home} label={match.home_label} dim={winner === 'away'} />
        <div className="min-w-20 text-center">
          {hasScore ? (
            <div className="flex items-center justify-center gap-1.5 font-display text-3xl font-bold">
              <Score value={match.home_score} highlight={winner === 'home'} />
              <span className="text-navy/30">:</span>
              <Score value={match.away_score} highlight={winner === 'away'} />
            </div>
          ) : (
            <span className="heading text-2xl text-red">vs</span>
          )}
        </div>
        <Side team={away} label={match.away_label} dim={winner === 'home'} />
      </div>
      {(aggLine || pens) && (
        <p className="mt-2 text-center text-sm font-bold text-navy/70">
          {aggLine}
          {aggLine && pens && ' · '}
          {pens && `${match.home_pens} – ${match.away_pens} on penalties`}
        </p>
      )}
      {match.note && <p className="mt-3 text-center text-xs font-semibold text-navy/50">{match.note}</p>}
    </motion.div>
  )
}

function Side({ team, label, dim }) {
  return (
    <div className={`flex min-w-0 flex-col items-center gap-1.5 text-center transition ${dim ? 'opacity-50' : ''}`}>
      {team ? (
        <TeamBadge team={team} />
      ) : (
        <span className="grid size-13 place-items-center rounded-full border-2 border-dashed border-navy/20 font-bold text-navy/30">?</span>
      )}
      <span className={`w-full truncate text-sm font-bold sm:text-base ${team ? '' : 'text-navy/50 italic'}`}>
        {team?.name ?? label ?? 'TBA'}
      </span>
    </div>
  )
}

function Score({ value, highlight }) {
  return (
    <span className="relative inline-block min-w-6">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: -24, opacity: 0, scale: 1.6 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          className={`inline-block ${highlight ? 'text-red' : 'text-navy'}`}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

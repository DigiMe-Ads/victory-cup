import { motion } from 'motion/react'
import { AlertTriangle, ArrowLeftRight, Trash2 } from 'lucide-react'
import TeamBadge from '../ui/TeamBadge'
import { groupTitle } from '../../lib/draw'

const small = 'rounded-lg border-2 border-navy/10 bg-white px-2 py-1 text-sm font-bold outline-none focus:border-navy'

export default function AdminMatchRow({ match, teams, teamsById, groups, pitches, clash, onUpdate, onDelete }) {
  const knockout = match.stage === 'knockout'
  const single = groups.length === 1
  // Group games pick from that group's teams; knockouts from everyone.
  const options = knockout || !match.group_id ? teams : teams.filter((t) => t.group_id === match.group_id)

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className={`rounded-xl border-2 bg-white p-3 ${clash ? 'border-red/40 bg-red-soft/40' : 'border-navy/8'}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1 text-xs font-bold text-navy/50">
          #
          <input
            type="number"
            min="1"
            key={`no-${match.match_no}`}
            defaultValue={match.match_no}
            onBlur={(e) => {
              const v = Number(e.target.value)
              if (v >= 1 && v !== match.match_no) onUpdate(match.id, { match_no: v })
            }}
            className={`${small} w-14 text-center`}
            aria-label="Match number"
          />
        </label>
        <select
          value={match.pitch}
          onChange={(e) => onUpdate(match.id, { pitch: Number(e.target.value) })}
          className={`${small} cursor-pointer`}
          aria-label="Pitch"
        >
          {Array.from({ length: Math.max(pitches, match.pitch) }, (_, i) => i + 1).map((p) => (
            <option key={p} value={p}>Pitch {p}</option>
          ))}
        </select>
        <input
          type="time"
          key={`ko-${match.kickoff}`}
          defaultValue={match.kickoff?.slice(0, 5) ?? ''}
          onBlur={(e) => e.target.value !== (match.kickoff?.slice(0, 5) ?? '') && onUpdate(match.id, { kickoff: e.target.value || null })}
          className={small}
          aria-label="Kick-off time"
        />
        {knockout ? (
          <input
            key={`rl-${match.round_label}`}
            defaultValue={match.round_label ?? ''}
            placeholder="Round, e.g. Final"
            onBlur={(e) => e.target.value !== (match.round_label ?? '') && onUpdate(match.id, { round_label: e.target.value || null })}
            className={`${small} w-36 bg-sun/20`}
            aria-label="Round name"
          />
        ) : (
          <span className="rounded-lg bg-ice px-2 py-1 text-sm font-bold">
            {groupTitle(groups.find((g) => g.id === match.group_id) ?? { name: '?' }, single)}
          </span>
        )}
        <button
          onClick={() => onDelete(match)}
          className="ml-auto grid size-8 cursor-pointer place-items-center rounded-lg text-navy/40 transition hover:bg-red-soft hover:text-red"
          title="Delete match"
          aria-label="Delete match"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 sm:flex-nowrap">
        <Side
          match={match}
          side="home"
          team={teamsById[match.home_team_id]}
          options={options}
          allowLabel={knockout}
          onUpdate={onUpdate}
        />
        <button
          onClick={() =>
            onUpdate(match.id, {
              home_team_id: match.away_team_id,
              away_team_id: match.home_team_id,
              home_label: match.away_label,
              away_label: match.home_label,
              home_score: match.away_score,
              away_score: match.home_score,
            })
          }
          className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-navy/40 transition hover:bg-ice hover:text-navy"
          title="Swap sides"
          aria-label="Swap sides"
        >
          <ArrowLeftRight className="size-4" />
        </button>
        <Side
          match={match}
          side="away"
          team={teamsById[match.away_team_id]}
          options={options}
          allowLabel={knockout}
          onUpdate={onUpdate}
        />
      </div>

      {clash && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red">
          <AlertTriangle className="size-3.5" /> A team plays twice at this kick-off time.
        </p>
      )}
      {match.home_team_id && match.home_team_id === match.away_team_id && (
        <p className="mt-2 text-xs font-bold text-red">A team can't play itself.</p>
      )}
    </motion.li>
  )
}

function Side({ match, side, team, options, allowLabel, onUpdate }) {
  const idKey = `${side}_team_id`
  const labelKey = `${side}_label`
  return (
    <div className="flex min-w-0 flex-1 basis-56 items-center gap-2">
      <TeamBadge team={team} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <select
          value={match[idKey] ?? ''}
          onChange={(e) => onUpdate(match.id, { [idKey]: e.target.value || null })}
          className={`${small} w-full min-w-0 cursor-pointer truncate`}
          aria-label={`${side} team`}
        >
          {(allowLabel || !match[idKey]) && <option value="">To be decided</option>}
          {options.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        {allowLabel && !match[idKey] && (
          <input
            key={`${labelKey}-${match[labelKey]}`}
            defaultValue={match[labelKey] ?? ''}
            placeholder="e.g. Winner A"
            onBlur={(e) => e.target.value !== (match[labelKey] ?? '') && onUpdate(match.id, { [labelKey]: e.target.value || null })}
            className={`${small} w-full font-semibold`}
            aria-label={`${side} placeholder`}
          />
        )}
      </div>
    </div>
  )
}

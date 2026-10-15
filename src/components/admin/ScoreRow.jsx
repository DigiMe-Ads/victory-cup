import { motion } from 'motion/react'
import { Flag, Minus, Plus } from 'lucide-react'
import TeamBadge from '../ui/TeamBadge'

const STATUSES = [
  { id: 'scheduled', label: 'Upcoming', active: 'bg-navy/10 text-navy' },
  { id: 'live', label: 'Live', active: 'bg-red text-white' },
  { id: 'finished', label: 'Full time', active: 'bg-mint text-navy' },
]

export default function ScoreRow({ match, teamsById, stageLabel, onUpdate }) {
  const home = teamsById[match.home_team_id]
  const away = teamsById[match.away_team_id]
  const hs = match.home_score ?? 0
  const as = match.away_score ?? 0

  function setScore(side, delta) {
    const key = side === 'home' ? 'home_score' : 'away_score'
    const current = side === 'home' ? hs : as
    const next = Math.max(0, current + delta)
    const patch = { [key]: next, home_score: side === 'home' ? next : hs, away_score: side === 'away' ? next : as }
    if (match.status === 'scheduled') patch.status = 'live'
    onUpdate(match.id, patch)
  }

  function walkover(winner) {
    const name = teamsById[winner === 'home' ? match.away_team_id : match.home_team_id]?.name
    if (!confirm(`Record a walkover (3–0) because ${name} did not show on time?`)) return
    onUpdate(match.id, {
      home_score: winner === 'home' ? 3 : 0,
      away_score: winner === 'away' ? 3 : 0,
      status: 'finished',
      note: `Walkover: ${name} late`,
    })
  }

  return (
    <motion.div
      layout
      className={`rounded-2xl border-2 bg-white p-4 ${match.status === 'live' ? 'border-red' : 'border-navy/5'}`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold">
          <span className="rounded-md bg-navy px-2 py-0.5 text-white">Pitch {match.pitch}</span>
          <span className="rounded-md bg-ice px-2 py-0.5">{stageLabel}</span>
          <span className="text-navy/40">#{match.match_no}</span>
        </span>
        <div className="flex rounded-xl bg-navy/5 p-0.5">
          {STATUSES.map((s) => (
            <button
              key={s.id}
              onClick={() =>
                s.id !== match.status &&
                onUpdate(match.id, {
                  status: s.id,
                  ...(s.id !== 'scheduled' && { home_score: hs, away_score: as }),
                  ...(s.id === 'scheduled' && { home_score: null, away_score: null, note: null }),
                })
              }
              className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold transition ${match.status === s.id ? s.active : 'text-navy/50 hover:text-navy'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Side team={home} label={match.home_label} score={hs} onInc={() => setScore('home', 1)} onDec={() => setScore('home', -1)} />
        <span className="heading text-2xl text-navy/30">:</span>
        <Side team={away} label={match.away_label} score={as} onInc={() => setScore('away', 1)} onDec={() => setScore('away', -1)} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-navy/5 pt-3">
        <input
          key={match.note ?? ''}
          defaultValue={match.note ?? ''}
          placeholder="Note (optional)"
          onBlur={(e) => e.target.value !== (match.note ?? '') && onUpdate(match.id, { note: e.target.value || null })}
          className="min-w-0 flex-1 rounded-xl border-2 border-navy/5 px-3 py-1.5 text-sm outline-none focus:border-red"
        />
        <div className="flex items-center gap-1 text-xs font-bold text-navy/50">
          <Flag className="size-3.5" /> Walkover to
          <button onClick={() => walkover('home')} className="cursor-pointer rounded-lg px-2 py-1 hover:bg-red-soft hover:text-red">
            {home?.name ?? 'Home'}
          </button>
          /
          <button onClick={() => walkover('away')} className="cursor-pointer rounded-lg px-2 py-1 hover:bg-red-soft hover:text-red">
            {away?.name ?? 'Away'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function Side({ team, label, score, onInc, onDec }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <TeamBadge team={team} />
      <span className="max-w-full truncate text-sm font-bold">{team?.name ?? label ?? 'To be decided'}</span>
      <div className="flex items-center gap-2">
        <StepButton onClick={onDec} label="Remove goal" icon={Minus} />
        <motion.span key={score} initial={{ scale: 1.8 }} animate={{ scale: 1 }} className="w-10 heading text-4xl">
          {score}
        </motion.span>
        <StepButton onClick={onInc} label="Add goal" icon={Plus} primary />
      </div>
    </div>
  )
}

function StepButton({ onClick, label, icon: Icon, primary }) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={onClick}
      aria-label={label}
      className={`grid size-10 cursor-pointer place-items-center rounded-2xl ${primary ? 'bg-red text-white shadow-[0_3px_0_0_#8f0e18]' : 'bg-navy/5 text-navy'}`}
    >
      <Icon className="size-5" strokeWidth={3} />
    </motion.button>
  )
}

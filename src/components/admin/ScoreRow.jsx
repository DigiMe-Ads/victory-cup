import { motion } from 'motion/react'
import { Flag, Minus, Plus } from 'lucide-react'
import TeamBadge from '../ui/TeamBadge'

const STATUSES = [
  { id: 'scheduled', label: 'Upcoming', active: 'bg-navy/10 text-navy' },
  { id: 'live', label: 'Live', active: 'bg-red text-white' },
  { id: 'finished', label: 'Full time', active: 'bg-mint text-navy' },
]

// needsPens: a drawn knockout (or level two-leg tie) – show the shoot-out score.
export default function ScoreRow({ match, teamsById, stageLabel, needsPens, aggText, onUpdate }) {
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

  function setPens(side, delta) {
    const hp = match.home_pens ?? 0
    const ap = match.away_pens ?? 0
    onUpdate(match.id, {
      home_pens: side === 'home' ? Math.max(0, hp + delta) : hp,
      away_pens: side === 'away' ? Math.max(0, ap + delta) : ap,
    })
  }

  const waiting = !match.home_team_id || !match.away_team_id

  function walkover(winner) {
    if (waiting) return
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
        <div className={`flex rounded-xl bg-navy/5 p-0.5 ${waiting ? 'pointer-events-none opacity-40' : ''}`} aria-disabled={waiting}>
          {STATUSES.map((s) => (
            <button
              key={s.id}
              onClick={() =>
                s.id !== match.status &&
                onUpdate(match.id, {
                  status: s.id,
                  ...(s.id !== 'scheduled' && { home_score: hs, away_score: as }),
                  ...(s.id === 'scheduled' && { home_score: null, away_score: null, home_pens: null, away_pens: null, note: null }),
                })
              }
              className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold transition ${match.status === s.id ? s.active : 'text-navy/50 hover:text-navy'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid grid-cols-[1fr_auto_1fr] items-center gap-3 ${waiting ? 'pointer-events-none opacity-40' : ''}`} aria-disabled={waiting}>
        <Side team={home} label={match.home_label} score={hs} onInc={() => setScore('home', 1)} onDec={() => setScore('home', -1)} />
        <span className="heading text-2xl text-navy/30">:</span>
        <Side team={away} label={match.away_label} score={as} onInc={() => setScore('away', 1)} onDec={() => setScore('away', -1)} />
      </div>

      {waiting && (
        <p className="mt-3 rounded-lg bg-sun/25 px-3 py-1.5 text-center text-xs font-bold">
          Waiting for the qualified teams – they fill in when the earlier games are finished.
        </p>
      )}
      {aggText && <p className="mt-3 text-center text-sm font-bold text-navy/60">{aggText}</p>}
      {needsPens && (
        <div className="mt-3 rounded-xl bg-sun/20 p-3">
          <p className="mb-2 text-center font-cond text-sm font-bold tracking-wider uppercase">
            Spot kicks (3 each, then sudden death)
          </p>
          <div className="flex items-center justify-center gap-4">
            <PenStep value={match.home_pens} onDec={() => setPens('home', -1)} onInc={() => setPens('home', 1)} />
            <span className="text-navy/30">–</span>
            <PenStep value={match.away_pens} onDec={() => setPens('away', -1)} onInc={() => setPens('away', 1)} />
          </div>
          <p className="mt-2 text-center text-xs text-navy/50">Still level after penalties? Note the coin toss winner below.</p>
        </div>
      )}

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

function PenStep({ value, onInc, onDec }) {
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={onDec} aria-label="Remove penalty" className="grid size-8 cursor-pointer place-items-center rounded-lg bg-white text-navy">
        <Minus className="size-4" strokeWidth={3} />
      </button>
      <span className="w-6 text-center font-display text-2xl font-bold">{value ?? 0}</span>
      <button onClick={onInc} aria-label="Add penalty" className="grid size-8 cursor-pointer place-items-center rounded-lg bg-navy text-white">
        <Plus className="size-4" strokeWidth={3} />
      </button>
    </div>
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

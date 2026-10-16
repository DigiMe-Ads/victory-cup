import { motion } from 'motion/react'
import { Trophy } from 'lucide-react'
import MatchCard from './MatchCard'
import TeamBadge from '../ui/TeamBadge'
import { formatTime } from '../../lib/format'
import { KO_FORMATS, champion } from '../../lib/knockout'

// Knockout rounds side by side (semis → final), with the champion once decided.
export default function KnockoutView({ tournament, matches, teamsById, groupsById, single }) {
  const ko = matches.filter((m) => m.stage === 'knockout').sort((a, b) => a.match_no - b.match_no)
  const format = KO_FORMATS[tournament.ko_format]
  const winnerId = champion(matches)
  const winner = teamsById[winnerId]

  if (!ko.length) {
    return (
      <div className="card p-10 text-center">
        <Trophy className="mx-auto size-12 text-red" />
        <p className="heading mt-3 text-3xl">Knockouts after the group stage</p>
        {format && <p className="mt-1 text-navy/60">{format.help}</p>}
      </div>
    )
  }

  const rounds = []
  for (const m of ko) {
    const name = /^semi/i.test(m.round_label ?? '') ? 'Semi-finals' : m.tie_key ? 'Final (two legs)' : m.round_label || 'Knockout'
    const last = rounds[rounds.length - 1]
    if (last?.name === name) last.matches.push(m)
    else rounds.push({ name, matches: [m] })
  }

  return (
    <div className="space-y-6">
      {winner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl bg-navy p-6 text-white"
        >
          <div className="absolute -top-8 -right-10 h-32 w-48 rotate-12 bg-red" />
          <div className="relative flex flex-wrap items-center gap-4">
            <Trophy className="size-12 text-sun" />
            <TeamBadge team={winner} size="lg" />
            <div>
              <p className="font-cond text-sm font-bold tracking-[0.25em] text-sun uppercase">
                {tournament.age_group} {tournament.segment === 'girls' ? 'Girls ' : ''}Champions
              </p>
              <p className="heading text-4xl">{winner.name}</p>
            </div>
          </div>
        </motion.div>
      )}

      {format && <p className="font-semibold text-navy/60">{format.help}</p>}

      <div className={`grid gap-6 ${rounds.length > 1 ? 'lg:grid-cols-[3fr_2fr]' : ''}`}>
        {rounds.map((r, i) => (
          <section key={r.name} className={i > 0 ? 'lg:self-center' : ''}>
            <h3 className="heading mb-3 flex items-center gap-3 text-2xl">
              {r.name} <span className="streak" />
            </h3>
            <div className="space-y-3">
              {r.matches.map((m) => (
                <div key={m.id}>
                  {m.kickoff && (
                    <p className="mb-1 font-cond text-sm font-bold tracking-wider text-navy/50 uppercase">
                      {r.matches.length > 1 && m.round_label ? `${m.round_label} · ` : ''}
                      {formatTime(m.kickoff)}
                    </p>
                  )}
                  <MatchCard match={m} teamsById={teamsById} groupsById={groupsById} single={single} matches={matches} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

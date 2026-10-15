import { motion } from 'motion/react'
import { LiveDot } from '../ui/StatusBadge'
import { groupByKickoff } from '../../lib/fixtures'

const nameOf = (m, side, teamsById) => teamsById[m[`${side}_team_id`]]?.name ?? m[`${side}_label`] ?? 'TBA'

// What's on right now (or what's next) across the pitches.
export default function LiveBanner({ matches, teamsById }) {
  const live = matches.filter((m) => m.status === 'live')
  const next = groupByKickoff(matches.filter((m) => m.status === 'scheduled'))[0]?.matches ?? []
  const list = live.length ? live : next
  if (!list.length || matches.every((m) => m.status === 'scheduled')) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-8 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center ${
        live.length ? 'bg-red text-white' : 'bg-sun text-navy'
      }`}
    >
      <span className="heading flex items-center gap-2 text-xl whitespace-nowrap">
        {live.length ? <LiveDot /> : '⏭'} {live.length ? 'Live now' : 'Up next'}
      </span>
      <div className="flex flex-1 flex-wrap gap-2">
        {list.map((m) => (
          <span key={m.id} className="rounded-xl bg-white/25 px-3 py-1.5 font-semibold">
            <span className="opacity-75">Pitch {m.pitch}:</span> {nameOf(m, 'home', teamsById)}{' '}
            {m.status === 'live' ? (
              <b>
                {m.home_score ?? 0} – {m.away_score ?? 0}
              </b>
            ) : (
              'vs'
            )}{' '}
            {nameOf(m, 'away', teamsById)}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

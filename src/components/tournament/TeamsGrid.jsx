import { motion } from 'motion/react'
import TeamBadge, { ColorDot } from '../ui/TeamBadge'
import { slotLabel } from '../../lib/draw'

// All teams in the category, with their colour and drawn slot.
export default function TeamsGrid({ teams, groupsById, single }) {
  if (!teams.length) return <p className="card p-10 text-center text-navy/60">Teams will be announced soon.</p>
  const sorted = [...teams].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((t, i) => {
        const g = groupsById[t.group_id]
        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.3) }}
            className="card flex items-center gap-3 p-3"
            style={{ borderLeft: `6px solid ${t.color}` }}
          >
            <TeamBadge team={t} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{t.name}</p>
              <p className="flex items-center gap-1.5 truncate text-sm text-navy/60">
                <ColorDot color={t.color} /> {t.club?.name ?? 'Independent'}
              </p>
            </div>
            {g && (
              <span className="rounded-md bg-red-soft px-2 py-1 font-cond text-sm font-bold text-red">
                {slotLabel(g, t.slot, single)}
              </span>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

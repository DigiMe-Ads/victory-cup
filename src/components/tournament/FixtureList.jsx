import { useState } from 'react'
import { motion } from 'motion/react'
import { CalendarClock, Clock } from 'lucide-react'
import MatchCard from './MatchCard'
import { formatTime } from '../../lib/format'
import { groupByKickoff } from '../../lib/fixtures'
import { groupTitle } from '../../lib/draw'

// Fixtures by kick-off time, with a filter per group / knockouts.
export default function FixtureList({ matches, teamsById, groups, groupsById }) {
  const [filter, setFilter] = useState('all')
  const single = groups.length === 1
  const hasKnockouts = matches.some((m) => m.stage === 'knockout')

  if (!matches.length) {
    return (
      <div className="card p-10 text-center">
        <CalendarClock className="mx-auto size-12 text-red" />
        <p className="heading mt-3 text-3xl">Fixtures coming soon</p>
        <p className="mt-1 text-navy/60">Match times appear here once the groups are drawn.</p>
      </div>
    )
  }

  const filters = [
    { id: 'all', label: 'All matches' },
    ...(single ? [] : groups.map((g) => ({ id: g.id, label: groupTitle(g) }))),
    ...(hasKnockouts ? [{ id: 'knockout', label: 'Knockouts' }] : []),
  ]
  const shown = matches.filter((m) =>
    filter === 'all' ? true : filter === 'knockout' ? m.stage === 'knockout' : m.group_id === filter,
  )

  return (
    <div>
      {filters.length > 2 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 font-cond text-base font-bold tracking-wide uppercase transition ${
                filter === f.id ? 'bg-red text-white' : 'bg-white text-navy/60 ring-1 ring-navy/10 hover:text-navy'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <ol className="relative space-y-6 before:absolute before:top-4 before:bottom-4 before:left-5 before:w-1 before:rounded-full before:bg-navy/10">
        {groupByKickoff(shown).map(({ key, kickoff, matches: list }, i) => {
          const live = list.some((m) => m.status === 'live')
          const done = list.every((m) => m.status === 'finished')
          return (
            <motion.li
              key={key}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
              className="relative pl-14"
            >
              <span
                className={`absolute top-1 left-0 grid size-11 place-items-center rounded-full ring-4 ring-[#f5f7fc] ${
                  live ? 'bg-red text-white' : done ? 'bg-mint text-white' : 'bg-navy text-white'
                }`}
              >
                <Clock className="size-5" />
              </span>
              <div className="mb-2 flex items-center gap-3 pt-2.5">
                <span className="heading text-xl">{kickoff ? formatTime(kickoff) : `Match ${list[0].match_no}`}</span>
                {live && <span className="text-sm font-bold text-red">Live now</span>}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {list.map((m) => (
                  <MatchCard key={m.id} match={m} teamsById={teamsById} groupsById={groupsById} single={single} />
                ))}
              </div>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}

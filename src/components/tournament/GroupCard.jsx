import { motion } from 'motion/react'
import TeamBadge from '../ui/TeamBadge'
import { groupTitle, slotLabel, slotMap } from '../../lib/draw'
import { computeStandings } from '../../lib/standings'

const PLACE = ['bg-sun text-navy', 'bg-navy/15 text-navy']

// One group: its draw slots (A1, A2…) and, once games are played, the table.
export default function GroupCard({ group, teams, matches, single = false, index = 0 }) {
  const bySlot = slotMap(teams, group.id)
  const members = [...bySlot.values()]
  const groupMatches = matches.filter((m) => m.group_id === group.id)
  const played = groupMatches.some((m) => m.status === 'finished')
  const standings = computeStandings(members, groupMatches)
  const rowsBySlot = Array.from({ length: group.size }, (_, i) => i + 1)

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card overflow-hidden"
    >
      <div className="flex items-center justify-between gap-2 bg-navy px-4 py-2.5 text-white">
        <h3 className="heading text-2xl">{groupTitle(group, single)}</h3>
        <span className="font-cond text-sm font-bold tracking-wider text-white/60 uppercase">
          {members.length}/{group.size} drawn
        </span>
      </div>

      <table className="w-full text-left">
        <thead className="border-b border-navy/10 font-cond text-xs font-bold tracking-wider text-navy/50 uppercase">
          <tr>
            <th className="py-2 pl-3">{played ? '#' : 'Slot'}</th>
            <th className="py-2">Team</th>
            <th className="px-1.5 py-2 text-center">P</th>
            {['W', 'D', 'L', 'GD'].map((h) => (
              <th key={h} className="hidden px-1.5 py-2 text-center sm:table-cell">{h}</th>
            ))}
            <th className="py-2 pr-3 text-center text-red">Pts</th>
          </tr>
        </thead>
        <tbody>
          {played
            ? standings.map((row, i) => (
                <motion.tr layout key={row.team.id} className="border-b border-navy/5 last:border-0">
                  <td className="py-2 pl-3">
                    <span className={`grid size-7 place-items-center rounded-md text-sm font-bold ${PLACE[i] ?? 'text-navy/50'}`}>{i + 1}</span>
                  </td>
                  <TeamCell team={row.team} label={slotLabel(group, row.team.slot, single)} />
                  <td className="px-1.5 py-2 text-center font-semibold text-navy/70">{row.played}</td>
                  {[row.won, row.drawn, row.lost, row.gd > 0 ? `+${row.gd}` : row.gd].map((v, k) => (
                    <td key={k} className="hidden px-1.5 py-2 text-center font-semibold text-navy/70 sm:table-cell">{v}</td>
                  ))}
                  <td className="py-2 pr-3 text-center font-display text-lg font-bold">{row.points}</td>
                </motion.tr>
              ))
            : rowsBySlot.map((slot) => {
                const team = bySlot.get(slot)
                return (
                  <tr key={slot} className="border-b border-navy/5 last:border-0">
                    <td className="py-2 pl-3">
                      <span className="grid h-7 min-w-9 place-items-center rounded-md bg-red-soft px-1.5 font-cond text-sm font-bold text-red">
                        {slotLabel(group, slot, single)}
                      </span>
                    </td>
                    {team ? (
                      <TeamCell team={team} />
                    ) : (
                      <td className="py-2 text-sm font-semibold text-navy/35 italic">Awaiting draw…</td>
                    )}
                    <td className="px-1.5 py-2 text-center text-navy/30">–</td>
                    <td className="hidden sm:table-cell" colSpan={4} />
                    <td className="py-2 pr-3 text-center text-navy/30">–</td>
                  </tr>
                )
              })}
        </tbody>
      </table>
    </motion.section>
  )
}

function TeamCell({ team, label }) {
  return (
    <td className="py-2">
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex min-w-0 items-center gap-2"
      >
        <TeamBadge team={team} size="sm" />
        <span className="min-w-0">
          <span className="block truncate font-semibold">{team.name}</span>
          {label && <span className="block font-cond text-xs font-bold text-navy/40">{label}</span>}
        </span>
      </motion.div>
    </td>
  )
}

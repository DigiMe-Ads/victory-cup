import { motion } from 'motion/react'
import TeamBadge from '../ui/TeamBadge'
import { groupTitle, slotLabel, slotMap } from '../../lib/draw'
import { computeStandings } from '../../lib/standings'


// One group: its draw slots (A1, A2…) and, once games are played, the table.
// The top `qualify` rows are marked as going through to the knockouts.
export default function GroupCard({ group, teams, matches, single = false, index = 0, qualify = 0, qualifyText }) {
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
            {['W', 'D', 'L', 'GF', 'GA'].map((h) => (
              <th key={h} className="hidden px-1.5 py-2 text-center sm:table-cell">{h}</th>
            ))}
            <th className="py-2 pr-3 text-center text-red">Pts</th>
          </tr>
        </thead>
        <tbody>
          {played
            ? standings.map((row, i) => (
                <motion.tr
                  layout
                  key={row.team.id}
                  className={`border-b border-navy/5 last:border-0 ${i < qualify ? 'bg-mint/8' : ''} ${i === qualify - 1 ? 'border-b-2! border-b-mint/50!' : ''}`}
                >
                  <td className="py-2 pl-3">
                    <span
                      className={`grid size-7 place-items-center rounded-md text-sm font-bold ${i < qualify ? 'bg-mint text-white' : 'text-navy/50'}`}
                      title={row.level ? 'Level on every tie-breaker – decided by spot kicks' : undefined}
                    >
                      {i + 1}
                      {row.level && '*'}
                    </span>
                  </td>
                  <TeamCell team={row.team} label={slotLabel(group, row.team.slot, single)} />
                  <td className="px-1.5 py-2 text-center font-semibold text-navy/70">{row.played}</td>
                  {[row.won, row.drawn, row.lost, row.gf, row.ga].map((v, k) => (
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
                    <td className="hidden sm:table-cell" colSpan={5} />
                    <td className="py-2 pr-3 text-center text-navy/30">–</td>
                  </tr>
                )
              })}
        </tbody>
      </table>
      {(qualifyText || standings.some((r) => r.level)) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-navy/5 px-3 py-2 text-xs font-semibold text-navy/55">
          {qualifyText && (
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-mint" /> {qualifyText}
            </span>
          )}
          {played && standings.some((r) => r.level) && <span>* Level on all tie-breakers – 3 spot kicks decide</span>}
        </div>
      )}
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

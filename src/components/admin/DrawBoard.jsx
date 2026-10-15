import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Hand, Minus, Plus, RotateCcw, Settings2, X } from 'lucide-react'
import Button from '../ui/Button'
import TeamBadge from '../ui/TeamBadge'
import { groupTitle, slotLabel, slotMap } from '../../lib/draw'

// Record the physical draw: pick the team that came out, then the slot it was
// drawn into (A1, B3, …) – in any order. Works the other way round too.
export default function DrawBoard({ groups, teams, onPlace, onRemove, onResize, onReset, onEditGroups }) {
  const [team, setTeam] = useState(null) // selected team id
  const [slot, setSlot] = useState(null) // { groupId, slot }
  const single = groups.length === 1
  const pot = teams.filter((t) => !t.group_id || !t.slot).sort((a, b) => a.name.localeCompare(b.name))
  const drawn = teams.length - pot.length
  const selectedTeam = teams.find((t) => t.id === team)

  function clear() {
    setTeam(null)
    setSlot(null)
  }

  async function pickTeam(id) {
    if (slot) {
      clear()
      await onPlace(id, slot.groupId, slot.slot)
    } else setTeam(team === id ? null : id)
  }

  async function pickSlot(group, n, occupant) {
    if (team && team !== occupant?.id) {
      clear()
      await onPlace(team, group.id, n, occupant)
    } else if (occupant) {
      setSlot(null)
      setTeam(team === occupant.id ? null : occupant.id) // pick it up to move it
    } else {
      setTeam(null)
      setSlot(slot?.groupId === group.id && slot.slot === n ? null : { groupId: group.id, slot: n })
    }
  }

  const hint = selectedTeam
    ? `Now click the slot ${selectedTeam.name} was drawn into.`
    : slot
      ? `Now click the team drawn into ${slotLabel(groups.find((g) => g.id === slot.groupId), slot.slot, single)}.`
      : 'Click the team that was drawn, then the slot it was drawn into (or the slot first, then the team).'

  return (
    <div className="space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid size-10 place-items-center rounded-xl bg-red text-white">
          <Hand className="size-5" />
        </span>
        <p className="min-w-52 flex-1 font-semibold">{hint}</p>
        <span className="rounded-lg bg-ice px-3 py-1.5 font-cond text-lg font-bold">
          {drawn}/{teams.length} drawn
        </span>
        {(team || slot) && (
          <Button variant="ghost" size="sm" icon={X} onClick={clear}>
            Cancel
          </Button>
        )}
        <Button variant="ghost" size="sm" icon={Settings2} onClick={onEditGroups}>
          Change groups
        </Button>
        <Button variant="danger" size="sm" icon={RotateCcw} onClick={onReset} disabled={!drawn}>
          Reset draw
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        {/* The pot */}
        <section className="card self-start p-4 lg:sticky lg:top-24">
          <h3 className="heading text-xl">Teams to draw ({pot.length})</h3>
          {pot.length === 0 ? (
            <p className="mt-3 rounded-lg bg-mint/15 px-3 py-2 text-sm font-semibold text-emerald-700">
              Every team has a slot. 🎉
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-1.5">
              <AnimatePresence initial={false}>
                {pot.map((t) => (
                  <motion.li key={t.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 30 }}>
                    <button
                      type="button"
                      onClick={() => pickTeam(t.id)}
                      className={`flex w-full cursor-pointer items-center gap-2 rounded-xl border-2 p-1.5 pr-3 text-left font-semibold transition ${
                        team === t.id
                          ? 'border-red bg-red-soft'
                          : slot
                            ? 'border-dashed border-navy/25 hover:border-red'
                            : 'border-navy/10 hover:border-navy'
                      }`}
                      style={{ borderLeftColor: t.color, borderLeftWidth: 6 }}
                    >
                      <TeamBadge team={t} size="sm" />
                      <span className="truncate">{t.name}</span>
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </section>

        {/* The groups and their slots */}
        <div className={`grid gap-4 self-start ${single ? '' : 'md:grid-cols-2'} ${groups.length > 2 ? '2xl:grid-cols-3' : ''}`}>
          {groups.map((g) => {
            const bySlot = slotMap(teams, g.id)
            const highest = Math.max(0, ...bySlot.keys())
            return (
              <section key={g.id} className="card overflow-hidden">
                <div className="flex items-center justify-between gap-2 bg-navy px-3 py-2 text-white">
                  <h4 className="heading text-xl">{groupTitle(g, single)}</h4>
                  <div className="flex items-center gap-1">
                    <SizeButton icon={Minus} label="Remove last slot" disabled={g.size <= Math.max(1, highest)} onClick={() => onResize(g, g.size - 1)} />
                    <span className="w-14 text-center text-sm font-semibold">{g.size} slots</span>
                    <SizeButton icon={Plus} label="Add a slot" onClick={() => onResize(g, g.size + 1)} />
                  </div>
                </div>
                <ul className="divide-y divide-navy/5">
                  {Array.from({ length: g.size }, (_, i) => i + 1).map((n) => {
                    const occupant = bySlot.get(n)
                    const isTarget = slot?.groupId === g.id && slot.slot === n
                    const lifted = occupant && occupant.id === team
                    return (
                      <li key={n} className="flex items-center gap-2 px-2 py-1.5">
                        <button
                          type="button"
                          onClick={() => pickSlot(g, n, occupant)}
                          className={`flex min-h-11 flex-1 cursor-pointer items-center gap-2.5 rounded-xl border-2 px-2 py-1 text-left transition ${
                            isTarget || lifted
                              ? 'border-red bg-red-soft'
                              : occupant
                                ? 'border-transparent hover:border-navy/20'
                                : team
                                  ? 'border-dashed border-red/50 bg-red-soft/40 hover:border-red'
                                  : 'border-dashed border-navy/15 hover:border-navy/40'
                          }`}
                        >
                          <span className="grid h-8 min-w-10 place-items-center rounded-lg bg-navy font-cond text-base font-bold text-white">
                            {slotLabel(g, n, single)}
                          </span>
                          {occupant ? (
                            <motion.span
                              key={occupant.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex min-w-0 items-center gap-2"
                            >
                              <TeamBadge team={occupant} size="sm" />
                              <span className="truncate font-bold">{occupant.name}</span>
                            </motion.span>
                          ) : (
                            <span className="text-sm font-semibold text-navy/35">{team ? 'Place here' : 'Empty slot'}</span>
                          )}
                        </button>
                        {occupant && (
                          <button
                            type="button"
                            onClick={() => onRemove(occupant)}
                            className="grid size-8 cursor-pointer place-items-center rounded-lg text-navy/40 transition hover:bg-red-soft hover:text-red"
                            title="Back to the pot"
                            aria-label={`Remove ${occupant.name} from ${slotLabel(g, n, single)}`}
                          >
                            <X className="size-4" />
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SizeButton({ icon: Icon, label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="grid size-7 cursor-pointer place-items-center rounded-md bg-white/10 transition hover:bg-white/25 disabled:cursor-default disabled:opacity-30"
    >
      <Icon className="size-3.5" strokeWidth={3} />
    </button>
  )
}

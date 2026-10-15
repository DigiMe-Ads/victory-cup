import { useState } from 'react'
import { Minus, Plus, Sparkles } from 'lucide-react'
import Button from '../ui/Button'
import { balancedSizes, groupLetter } from '../../lib/draw'

// Choose how many groups and how many slots each one has. Sizes can be uneven,
// and one group holding every team is fine too.
export default function GroupSetup({ teamCount, existing, onCreate, onCancel }) {
  const [count, setCount] = useState(existing.length || defaultGroups(teamCount))
  const [sizes, setSizes] = useState(() =>
    existing.length ? existing.map((g) => g.size) : balancedSizes(teamCount, defaultGroups(teamCount)),
  )
  const [busy, setBusy] = useState(false)
  const total = sizes.reduce((a, b) => a + b, 0)

  function changeCount(n) {
    const next = Math.min(8, Math.max(1, n))
    setCount(next)
    setSizes(balancedSizes(teamCount, next))
  }

  function changeSize(i, v) {
    setSizes((s) => s.map((x, k) => (k === i ? Math.min(32, Math.max(1, v)) : x)))
  }

  async function submit() {
    setBusy(true)
    await onCreate(sizes.map((size, i) => ({ name: groupLetter(i), size, sort_order: i + 1 })))
    setBusy(false)
  }

  const diff = total - teamCount

  return (
    <div className="card p-5 sm:p-6">
      <h3 className="heading text-2xl">{existing.length ? 'Change groups' : 'Set up the groups'}</h3>
      <p className="mt-1 text-navy/60">
        {teamCount} teams in this category. Pick the number of groups, then adjust any group's size.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="label mb-0! mr-2">Number of groups</span>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => changeCount(n)}
            className={`grid size-10 cursor-pointer place-items-center rounded-lg font-display text-lg font-bold transition ${
              count === n ? 'bg-navy text-white' : 'bg-ice text-navy hover:bg-navy/10'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sizes.map((size, i) => (
          <div key={i} className="flex items-center justify-between gap-3 rounded-xl border-2 border-navy/10 p-3">
            <span className="heading text-xl">{count === 1 ? 'One league' : `Group ${groupLetter(i)}`}</span>
            <div className="flex items-center gap-2">
              <Step icon={Minus} onClick={() => changeSize(i, size - 1)} label="Fewer slots" />
              <span className="w-16 text-center font-semibold">
                <b className="font-display text-xl">{size}</b> teams
              </span>
              <Step icon={Plus} onClick={() => changeSize(i, size + 1)} label="More slots" />
            </div>
          </div>
        ))}
      </div>

      <p
        className={`mt-4 rounded-lg px-3 py-2 text-sm font-semibold ${
          diff === 0 ? 'bg-mint/15 text-emerald-700' : diff > 0 ? 'bg-sun/30 text-navy' : 'bg-red-soft text-red'
        }`}
      >
        {total} slots for {teamCount} teams
        {diff === 0 ? ' ✓' : diff > 0 ? ` · ${diff} slot${diff > 1 ? 's' : ''} will stay empty (e.g. a team still to confirm)` : ` · ${-diff} team${diff < -1 ? 's' : ''} won't have a slot`}
      </p>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button icon={Sparkles} onClick={submit} disabled={busy}>
          {busy ? 'Saving…' : existing.length ? 'Replace groups' : 'Create groups'}
        </Button>
      </div>
      {existing.length > 0 && (
        <p className="mt-2 text-right text-xs text-navy/50">Replacing groups clears the draw and the group-stage fixtures.</p>
      )}
    </div>
  )
}

function defaultGroups(teamCount) {
  if (teamCount <= 5) return 1
  return Math.max(2, Math.round(teamCount / 4))
}

function Step({ icon: Icon, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-8 cursor-pointer place-items-center rounded-lg bg-ice text-navy transition hover:bg-navy hover:text-white"
    >
      <Icon className="size-4" strokeWidth={3} />
    </button>
  )
}

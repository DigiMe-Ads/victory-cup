import { useState } from 'react'
import { Trophy } from 'lucide-react'
import Button from '../ui/Button'
import { KO_FORMATS, defaultFormat } from '../../lib/knockout'

// Pick the knockout format (pre-selected from the tournament brief) and create its matches.
export default function KnockoutSetup({ tournament, groups, teams, knockouts, onCreate }) {
  const suggested = defaultFormat(groups, teams.length)
  const [format, setFormat] = useState(tournament.ko_format || suggested)
  const [busy, setBusy] = useState(false)
  const options = Object.entries(KO_FORMATS).filter(([id]) => (id === 'cross-semis' ? groups.length >= 2 : groups.length === 1))

  async function create() {
    setBusy(true)
    await onCreate(format)
    setBusy(false)
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-sun text-navy">
          <Trophy className="size-5" />
        </span>
        <div className="min-w-48 flex-1">
          <h3 className="heading text-xl">Knockout stage</h3>
          <p className="text-sm text-navy/60">
            {knockouts.length
              ? `${knockouts.length} knockout match${knockouts.length > 1 ? 'es' : ''} set up. Teams fill in when the group games are finished.`
              : 'Not set up yet. Teams fill in automatically from the group results.'}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="min-w-60 flex-1">
          <span className="label">Format</span>
          <select className="input cursor-pointer" value={format} onChange={(e) => setFormat(e.target.value)}>
            {options.map(([id, f]) => (
              <option key={id} value={id}>
                {f.label}
                {id === suggested ? ' (as in the brief)' : ''}
              </option>
            ))}
          </select>
        </label>
        <Button variant="dark" icon={Trophy} onClick={create} disabled={busy || !options.length}>
          {busy ? 'Creating…' : knockouts.length ? 'Recreate knockouts' : 'Create knockouts'}
        </Button>
      </div>
      {KO_FORMATS[format] && <p className="mt-2 text-sm text-navy/60">{KO_FORMATS[format].help}</p>}
    </div>
  )
}

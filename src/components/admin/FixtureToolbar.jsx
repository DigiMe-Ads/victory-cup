import { useState } from 'react'
import { Clock, Eraser, Swords, Wand2 } from 'lucide-react'
import Button from '../ui/Button'

export default function FixtureToolbar({
  pitches,
  canGenerate,
  hasMatches,
  breakMinutes,
  onBreakChange,
  onGenerate,
  onTimes,
  onKnockout,
  onClear,
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Button icon={Wand2} variant="sun" onClick={onGenerate} disabled={!canGenerate}>
          Generate group fixtures
        </Button>
        <Button icon={Swords} variant="dark" onClick={onKnockout}>
          Add knockout match
        </Button>
        <Button icon={Clock} variant="ghost" onClick={() => setOpen(!open)} disabled={!hasMatches}>
          Kick-off times
        </Button>
        <Button icon={Eraser} variant="danger" onClick={onClear} disabled={!hasMatches}>
          Clear all
        </Button>
      </div>
      <p className="text-sm text-navy/60">
        Every team in a group plays each other once, in slot order (1 v 2 first). Games are spread over{' '}
        <b>{pitches} pitch{pitches > 1 ? 'es' : ''}</b> with rests between games where possible. Change the pitch
        count, start time and match length under <b>Details</b>.
      </p>
      {open && (
        <div className="flex flex-wrap items-end gap-3 rounded-xl bg-sun/15 p-4">
          <label>
            <span className="label">Break between games (min)</span>
            <input
              type="number"
              min="0"
              className="input w-32!"
              value={breakMinutes}
              onChange={(e) => onBreakChange(Math.max(0, Number(e.target.value) || 0))}
            />
          </label>
          <Button
            onClick={() => {
              onTimes()
              setOpen(false)
            }}
          >
            Fill all kick-off times
          </Button>
          <p className="w-full text-xs text-navy/60">
            Times start at the category's start time and step by match length + break, following the match numbers.
            You can still edit any single time.
          </p>
        </div>
      )}
    </div>
  )
}

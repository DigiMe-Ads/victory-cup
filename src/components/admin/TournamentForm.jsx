import { useState } from 'react'
import Button from '../ui/Button'
import { SEGMENTS, slugify } from '../../lib/format'
import { EVENT } from '../../data/info'

const EMPTY = {
  name: '',
  slug: '',
  segment: 'mixed',
  age_group: '',
  season: EVENT.name,
  event_date: EVENT.date,
  start_time: '08:00',
  venue: EVENT.venue,
  match_minutes: 12,
  pitches: 2,
  status: 'upcoming',
  sort_order: 0,
  description: '',
}

export default function TournamentForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => ({ ...EMPTY, ...clean(initial) }))
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.id))
  const [busy, setBusy] = useState(false)

  function set(key, value) {
    setValues((v) => {
      const next = { ...v, [key]: value }
      if ((key === 'age_group' || key === 'segment') && !slugTouched) next.slug = slugify(`${next.age_group} ${next.segment}`)
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    const payload = {
      ...values,
      slug: slugify(values.slug || `${values.age_group} ${values.segment}`),
      match_minutes: Number(values.match_minutes) || 12,
      pitches: Math.min(8, Math.max(1, Number(values.pitches) || 1)),
      sort_order: Number(values.sort_order) || 0,
      event_date: values.event_date || null,
      start_time: values.start_time || null,
    }
    await onSubmit(payload)
    setBusy(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Age group">
        <input className="input" required value={values.age_group ?? ''} onChange={(e) => set('age_group', e.target.value)} placeholder="U12" />
      </Field>
      <Field label="Segment">
        <select className="input cursor-pointer" value={values.segment} onChange={(e) => set('segment', e.target.value)}>
          {SEGMENTS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </Field>
      <Field label="Display name" className="sm:col-span-2">
        <input className="input" required value={values.name} onChange={(e) => set('name', e.target.value)} placeholder="Under 12" />
      </Field>
      <Field label="Date">
        <input type="date" className="input" value={values.event_date ?? ''} onChange={(e) => set('event_date', e.target.value)} />
      </Field>
      <Field label="First kick-off">
        <input type="time" className="input" value={values.start_time ?? ''} onChange={(e) => set('start_time', e.target.value)} />
      </Field>
      <Field label="Match length (minutes)">
        <input type="number" min="1" className="input" value={values.match_minutes} onChange={(e) => set('match_minutes', e.target.value)} />
      </Field>
      <Field label="Pitches used at the same time">
        <input type="number" min="1" max="8" className="input" value={values.pitches} onChange={(e) => set('pitches', e.target.value)} />
      </Field>
      <Field label="Venue" className="sm:col-span-2">
        <input className="input" value={values.venue ?? ''} onChange={(e) => set('venue', e.target.value)} />
      </Field>
      <Field label="Web address">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-navy/50">/t/</span>
          <input
            className="input"
            required
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true)
              set('slug', e.target.value)
            }}
          />
        </div>
      </Field>
      <Field label="Order on home page">
        <input type="number" className="input" value={values.sort_order} onChange={(e) => set('sort_order', e.target.value)} />
      </Field>
      <Field label="Short description" className="sm:col-span-2">
        <textarea rows={2} className="input" value={values.description ?? ''} onChange={(e) => set('description', e.target.value)} />
      </Field>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : initial?.id ? 'Save changes' : 'Create age group'}
        </Button>
      </div>
    </form>
  )
}

function Field({ label, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
    </label>
  )
}

// Postgres returns "08:00:00"; <input type="time"> wants "08:00".
function clean(t) {
  if (!t) return {}
  const { created_at: _c, teams: _t, groups: _g, ...rest } = t
  return { ...rest, start_time: t.start_time?.slice(0, 5) ?? '' }
}

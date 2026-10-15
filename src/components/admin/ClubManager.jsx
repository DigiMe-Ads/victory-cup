import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Button from '../ui/Button'
import LogoPicker from './LogoPicker'
import ColorPicker from './ColorPicker'
import { useAction } from '../../hooks/useToast'
import { deleteClub, removeTeamLogo, saveClub } from '../../lib/api'

// Clubs hold the logo every one of their teams shows. Changing it here updates all categories.
export default function ClubManager({ clubs, refresh }) {
  const run = useAction()
  const [adding, setAdding] = useState(false)

  async function update(club, values) {
    const ok = await run(() => saveClub({ id: club.id, ...values }).then(() => true), 'Club saved')
    // Only uploaded logos live in Storage; the built-in ones are in /logos.
    if (ok && 'logo_url' in values && club.logo_url?.includes('/storage/')) removeTeamLogo(club.logo_url).catch(() => {})
    refresh()
  }

  async function add(values) {
    const ok = await run(() => saveClub({ ...values, sort_order: clubs.length + 1 }).then(() => true), `${values.short_name} added`)
    if (ok) setAdding(false)
    refresh()
  }

  async function remove(club) {
    if (!confirm(`Delete ${club.name}? Its teams stay, but lose the club logo.`)) return
    await run(() => deleteClub(club.id), 'Club deleted')
    refresh()
  }

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-2">
        {clubs.map((c) => (
          <ClubRow key={`${c.id}-${c.name}-${c.short_name}`} club={c} onUpdate={(v) => update(c, v)} onDelete={() => remove(c)} />
        ))}
      </div>
      <div className="mt-4">
        {adding ? (
          <NewClub onAdd={add} onCancel={() => setAdding(false)} />
        ) : (
          <Button icon={Plus} variant="ghost" onClick={() => setAdding(true)}>
            Add club
          </Button>
        )}
      </div>
    </div>
  )
}

function ClubRow({ club, onUpdate, onDelete }) {
  const [name, setName] = useState(club.name)
  const [short, setShort] = useState(club.short_name)
  const [showColor, setShowColor] = useState(false)

  return (
    <div className="card flex gap-3 p-3">
      <div className="grid size-20 shrink-0 place-items-center rounded-xl bg-ice p-1.5">
        {club.logo_url ? (
          <img src={club.logo_url} alt="" className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="heading text-navy/30">Logo</span>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <input
          className="w-full rounded-lg border-2 border-transparent px-1.5 py-0.5 font-bold outline-none hover:border-navy/10 focus:border-navy"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() && name.trim() !== club.name && onUpdate({ name: name.trim() })}
          aria-label="Club name"
        />
        <div className="flex items-center gap-2">
          <input
            className="w-36 rounded-lg border-2 border-navy/10 px-1.5 py-0.5 text-sm font-semibold outline-none focus:border-navy"
            value={short}
            onChange={(e) => setShort(e.target.value)}
            onBlur={() => short.trim() && short.trim() !== club.short_name && onUpdate({ short_name: short.trim() })}
            aria-label="Short name"
            title="Short name, used for new team names"
          />
          <button
            type="button"
            onClick={() => setShowColor(!showColor)}
            className="size-6 cursor-pointer rounded-full ring-2 ring-white shadow"
            style={{ backgroundColor: club.color }}
            title="Default colour for new teams"
            aria-label="Club colour"
          />
          <button
            type="button"
            onClick={onDelete}
            className="ml-auto grid size-7 cursor-pointer place-items-center rounded-lg text-navy/40 hover:bg-red-soft hover:text-red"
            aria-label="Delete club"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
        {showColor && (
          <ColorPicker
            value={club.color}
            onChange={(color) => {
              onUpdate({ color })
              setShowColor(false)
            }}
          />
        )}
        <LogoPicker value={club.logo_url} onChange={(logo_url) => onUpdate({ logo_url })} emptyLabel="Add logo" />
      </div>
    </div>
  )
}

function NewClub({ onAdd, onCancel }) {
  const [name, setName] = useState('')
  const [short, setShort] = useState('')
  const [logo, setLogo] = useState(null)
  return (
    <form
      className="card grid gap-3 p-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (name.trim()) onAdd({ name: name.trim(), short_name: (short || name).trim(), logo_url: logo })
      }}
    >
      <input className="input" placeholder="Club name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      <input className="input" placeholder="Short name, e.g. Kickerz" value={short} onChange={(e) => setShort(e.target.value)} />
      <LogoPicker value={logo} onChange={setLogo} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={!name.trim()}>Add club</Button>
      </div>
    </form>
  )
}

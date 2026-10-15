import { useState } from 'react'
import { motion } from 'motion/react'
import { Check, ImagePlus, Palette, Trash2 } from 'lucide-react'
import TeamBadge from '../ui/TeamBadge'
import ColorPicker from './ColorPicker'
import LogoPicker from './LogoPicker'
import { slotLabel } from '../../lib/draw'

export default function TeamRow({ team, clubs, group, single, onUpdate, onDelete }) {
  const [name, setName] = useState(team.name)
  const [panel, setPanel] = useState(null) // 'color' | 'logo' | null
  const dirty = name.trim() && name.trim() !== team.name

  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: 40 }}
      className="card p-3"
      style={{ borderLeft: `6px solid ${team.color}` }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <TeamBadge team={team} size="sm" />
        <form
          className="flex min-w-40 flex-1 items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (dirty) onUpdate(team.id, { name: name.trim() })
          }}
        >
          <input
            className="w-full min-w-0 rounded-lg border-2 border-transparent bg-transparent px-2 py-1 font-bold outline-none hover:border-navy/10 focus:border-navy"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => dirty && onUpdate(team.id, { name: name.trim() })}
            aria-label="Team name"
          />
          {dirty && (
            <button type="submit" className="grid size-8 place-items-center rounded-lg bg-mint text-white" aria-label="Save name">
              <Check className="size-4" />
            </button>
          )}
        </form>
        <select
          value={team.club_id ?? ''}
          onChange={(e) => onUpdate(team.id, { club_id: e.target.value || null })}
          className="max-w-44 cursor-pointer rounded-lg border-2 border-navy/10 bg-white px-2 py-1 text-sm font-semibold outline-none focus:border-navy"
          aria-label="Club"
        >
          <option value="">No club</option>
          {clubs.map((c) => (
            <option key={c.id} value={c.id}>{c.short_name}</option>
          ))}
        </select>
        {group && (
          <span className="rounded-md bg-red-soft px-2 py-1 font-cond text-sm font-bold text-red" title="Drawn slot">
            {slotLabel(group, team.slot, single)}
          </span>
        )}
        <div className="flex items-center gap-1">
          <Icon onClick={() => setPanel(panel === 'color' ? null : 'color')} label="Change colour" icon={Palette} active={panel === 'color'} />
          <Icon onClick={() => setPanel(panel === 'logo' ? null : 'logo')} label="Team logo" icon={ImagePlus} active={panel === 'logo'} />
          <Icon onClick={() => onDelete(team)} label="Remove team" icon={Trash2} danger />
        </div>
      </div>
      {panel === 'color' && (
        <div className="mt-3 border-t border-navy/5 pt-3">
          <ColorPicker
            value={team.color}
            onChange={(color) => {
              onUpdate(team.id, { color })
              setPanel(null)
            }}
          />
        </div>
      )}
      {panel === 'logo' && (
        <div className="mt-3 border-t border-navy/5 pt-3">
          <LogoPicker
            value={team.logo_url}
            onChange={(logo_url) => {
              onUpdate(team.id, { logo_url })
              setPanel(null)
            }}
            emptyLabel="Use a different logo for this team"
          />
          <p className="mt-2 text-xs text-navy/50">
            By default the team shows its club's logo (change club logos in Admin → Clubs). The team colour stays as a ring around it.
          </p>
        </div>
      )}
    </motion.li>
  )
}

function Icon({ onClick, label, icon: IconCmp, danger, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`grid size-8 cursor-pointer place-items-center rounded-lg transition ${active ? 'bg-ice text-navy' : 'text-navy/50'} ${
        danger ? 'hover:bg-red-soft hover:text-red' : 'hover:bg-ice hover:text-navy'
      }`}
    >
      <IconCmp className="size-4" />
    </button>
  )
}

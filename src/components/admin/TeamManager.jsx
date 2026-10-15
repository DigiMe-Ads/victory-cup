import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Plus } from 'lucide-react'
import TeamRow from './TeamRow'
import LogoPicker from './LogoPicker'
import ColorPicker from './ColorPicker'
import Button from '../ui/Button'
import TeamBadge from '../ui/TeamBadge'
import { useAction } from '../../hooks/useToast'
import { addTeams, deleteTeam, removeTeamLogo, saveClub, updateTeam } from '../../lib/api'
import { TEAM_COLORS } from '../../lib/format'

export default function TeamManager({ tournament, teams, groupsById, groups, clubs, matches, refresh }) {
  const run = useAction()
  const single = groups.length === 1
  const sorted = [...teams].sort((a, b) => (a.club?.sort_order ?? 99) - (b.club?.sort_order ?? 99) || a.name.localeCompare(b.name))

  // A brand-new club is saved first so its badge is reusable in every age group.
  async function handleAdd(row, newClub) {
    const ok = await run(async () => {
      let clubId = row.club_id
      if (newClub) clubId = (await saveClub({ ...newClub, color: row.color, sort_order: clubs.length + 1 })).id
      await addTeams([{ ...row, club_id: clubId, tournament_id: tournament.id }])
      return true
    }, newClub ? `${row.name} added with its new club badge` : `${row.name} added`)
    refresh()
    return ok
  }

  async function handleUpdate(id, values) {
    const old = teams.find((t) => t.id === id)?.logo_url
    const ok = await run(() => updateTeam(id, values).then(() => true), 'Team saved')
    if (ok && 'logo_url' in values && old && old !== values.logo_url) removeTeamLogo(old).catch(() => {})
    refresh()
  }

  async function handleDelete(team) {
    const count = matches.filter((m) => m.home_team_id === team.id || m.away_team_id === team.id).length
    const extra = count ? ` Their ${count} match${count > 1 ? 'es' : ''} will be removed too.` : ''
    if (!confirm(`Remove ${team.name}?${extra}`)) return
    const ok = await run(() => deleteTeam(team.id).then(() => true), `${team.name} removed`)
    if (ok && team.logo_url) removeTeamLogo(team.logo_url).catch(() => {})
    refresh()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="heading text-2xl">Teams</h3>
          <span className="text-sm font-bold text-navy/50">{teams.length} confirmed</span>
        </div>
        {teams.length === 0 ? (
          <p className="card p-10 text-center text-navy/50">No teams yet. Add the confirmed teams on the right.</p>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {sorted.map((t) => (
                <TeamRow
                  key={`${t.id}-${t.name}`}
                  team={t}
                  clubs={clubs}
                  group={groupsById[t.group_id]}
                  single={single}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
      <div className="lg:sticky lg:top-24 lg:self-start">
        <AddTeamForm clubs={clubs} teams={teams} onAdd={handleAdd} />
      </div>
    </div>
  )
}

// Pick a club → name and colour are suggested ("Kickerz C", next free colour).
// Or choose "New club" to add a brand-new team with its own badge.
const NEW = '__new__'

function AddTeamForm({ clubs, teams, onAdd }) {
  const [clubId, setClubId] = useState('')
  const [name, setName] = useState('')
  const [color, setColor] = useState(TEAM_COLORS[0])
  const [clubName, setClubName] = useState('')
  const [logo, setLogo] = useState(null)
  const [busy, setBusy] = useState(false)
  const isNew = clubId === NEW
  const club = clubs.find((c) => c.id === clubId)

  function pickClub(id) {
    setClubId(id)
    const c = clubs.find((x) => x.id === id)
    if (!c) return
    const existing = teams.filter((t) => t.club_id === id)
    setName(existing.length ? `${c.short_name} ${String.fromCharCode(65 + existing.length)}` : c.short_name)
    const used = new Set(existing.map((t) => t.color))
    setColor(used.has(c.color) ? TEAM_COLORS.find((x) => !used.has(x)) ?? c.color : c.color)
  }

  async function submit(e) {
    e.preventDefault()
    if (!name.trim() || (isNew && !clubName.trim())) return
    setBusy(true)
    const newClub = isNew ? { name: clubName.trim(), short_name: name.trim(), logo_url: logo } : null
    const ok = await onAdd({ name: name.trim(), club_id: isNew ? null : clubId || null, color }, newClub)
    setBusy(false)
    if (!ok) return
    setName('')
    setClubId('')
    setClubName('')
    setLogo(null)
  }

  const preview = { name: name || 'New team', color, logo: isNew ? logo : club?.logo_url }

  return (
    <form onSubmit={submit} className="card space-y-3 p-5">
      <h3 className="heading text-xl">Add a team</h3>
      <label className="block">
        <span className="label">Club</span>
        <select className="input cursor-pointer" value={clubId} onChange={(e) => pickClub(e.target.value)}>
          <option value="">Choose a club…</option>
          {clubs.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
          <option value={NEW}>+ New club / school…</option>
        </select>
      </label>
      {isNew && (
        <div className="space-y-3 rounded-xl border-2 border-dashed border-red/30 bg-red-soft/40 p-3">
          <label className="block">
            <span className="label">Club or school name</span>
            <input
              className="input"
              value={clubName}
              onChange={(e) => {
                setClubName(e.target.value)
                if (!name || name === clubName) setName(e.target.value)
              }}
              placeholder="e.g. Royal Football Academy"
              autoFocus
            />
          </label>
          <div>
            <span className="label">Badge / logo</span>
            <LogoPicker value={logo} onChange={setLogo} emptyLabel="Upload badge" />
          </div>
        </div>
      )}
      <label className="block">
        <span className="label">Team name</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kickerz C" />
      </label>
      <div>
        <span className="label">Team colour</span>
        <ColorPicker value={color} onChange={setColor} />
      </div>
      <div className="flex items-center gap-3 rounded-xl bg-ice p-3">
        <TeamBadge team={preview} />
        <span className="font-bold">{preview.name}</span>
      </div>
      <Button type="submit" icon={Plus} className="w-full" disabled={busy || !name.trim() || (isNew && !clubName.trim())}>
        {busy ? 'Adding…' : 'Add team'}
      </Button>
      <p className="text-xs text-navy/50">
        Clubs with more than one team share a badge, so give each team its own colour. A new club is also saved under
        Admin → Clubs &amp; logos, so you can pick it in other age groups.
      </p>
    </form>
  )
}

import { useState } from 'react'
import GroupSetup from './GroupSetup'
import DrawBoard from './DrawBoard'
import { useAction } from '../../hooks/useToast'
import { addGroups, clearDraw, clearMatches, deleteGroups, placeTeam, updateGroup, updateTeam } from '../../lib/api'
import { slotLabel } from '../../lib/draw'

// Step 2 in admin: create the groups, then record the draw slot by slot.
export default function GroupsAdmin({ tournament, groups, teams, matches, refresh, setTeams }) {
  const run = useAction()
  const [editing, setEditing] = useState(false)
  const single = groups.length === 1

  async function handleCreate(rows) {
    const games = matches.length
    if (groups.length && !confirm(`Replace the groups? The draw${games ? ` and all ${games} matches (group and knockout)` : ''} will be cleared.`)) return
    const ok = await run(async () => {
      await clearDraw(tournament.id)
      // Knockouts point at the old groups, so they go too (recreate them in Fixtures).
      await clearMatches(tournament.id, 'knockout')
      await deleteGroups(groups.map((g) => g.id))
      await addGroups(rows.map((r) => ({ ...r, tournament_id: tournament.id })))
      return true
    }, rows.length === 1 ? 'One group created' : `${rows.length} groups created`)
    if (ok) setEditing(false)
    refresh()
  }

  // Optimistic: move the team on screen straight away, then save.
  function local(patches) {
    setTeams((list) => list.map((t) => (patches[t.id] ? { ...t, ...patches[t.id] } : t)))
  }

  async function handlePlace(teamId, groupId, slot, occupant) {
    const group = groups.find((g) => g.id === groupId)
    const team = teams.find((t) => t.id === teamId)
    local({
      ...(occupant && { [occupant.id]: { group_id: null, slot: null } }),
      [teamId]: { group_id: groupId, slot },
    })
    const label = slotLabel(group, slot, single)
    await run(
      () => placeTeam(teamId, groupId, slot, occupant?.id),
      occupant ? `${team?.name} → ${label} (${occupant.name} back in the pot)` : `${team?.name} → ${label}`,
    )
    refresh()
  }

  async function handleRemove(team) {
    local({ [team.id]: { group_id: null, slot: null } })
    await run(() => updateTeam(team.id, { group_id: null, slot: null }), `${team.name} back in the pot`)
    refresh()
  }

  async function handleResize(group, size) {
    await run(() => updateGroup(group.id, { size }))
    refresh()
  }

  async function handleReset() {
    if (!confirm('Clear every slot and put all teams back in the pot?')) return
    await run(() => clearDraw(tournament.id), 'Draw reset')
    refresh()
  }

  if (!groups.length || editing) {
    return (
      <GroupSetup
        teamCount={teams.length}
        existing={groups}
        onCreate={handleCreate}
        onCancel={groups.length ? () => setEditing(false) : null}
      />
    )
  }

  return (
    <DrawBoard
      groups={groups}
      teams={teams}
      onPlace={handlePlace}
      onRemove={handleRemove}
      onResize={handleResize}
      onReset={handleReset}
      onEditGroups={() => setEditing(true)}
    />
  )
}

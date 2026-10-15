// Group & draw-slot helpers.

export const groupLetter = (i) => String.fromCharCode(65 + i) // 0 → A

// Spread teams as evenly as possible: 11 teams in 3 groups → [4, 4, 3].
export function balancedSizes(teamCount, groupCount) {
  const n = Math.max(1, groupCount)
  const base = Math.floor(teamCount / n)
  const extra = teamCount % n
  return Array.from({ length: n }, (_, i) => Math.max(1, base + (i < extra ? 1 : 0)))
}

// "A3", or just "3" when the whole category is one group.
export function slotLabel(group, slot, singleGroup = false) {
  if (!group || !slot) return ''
  return singleGroup ? String(slot) : `${group.name}${slot}`
}

export const groupTitle = (group, singleGroup = false) =>
  singleGroup ? 'League' : /^[A-Z]$/i.test(group.name) ? `Group ${group.name}` : group.name

// Teams in a group keyed by slot number.
export function slotMap(teams, groupId) {
  const map = new Map()
  for (const t of teams) if (t.group_id === groupId && t.slot) map.set(t.slot, t)
  return map
}

export const teamsInGroup = (teams, groupId) =>
  teams.filter((t) => t.group_id === groupId && t.slot).sort((a, b) => a.slot - b.slot)

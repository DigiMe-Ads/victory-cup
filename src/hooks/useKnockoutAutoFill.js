import { useEffect, useRef } from 'react'
import { useToast } from './useToast'
import { updateMatch } from '../lib/api'
import { pendingFills } from '../lib/knockout'

// Admin only: as soon as a group (or a semi-final) is decided, put the qualified
// teams into their empty knockout places. Places already filled – including a
// team picked by hand after spot kicks – are never overwritten.
export function useKnockoutAutoFill({ groups, teams, teamsById, matches, refresh }, enabled) {
  const toast = useToast()
  const busy = useRef(false)

  useEffect(() => {
    if (!enabled || busy.current) return
    const fills = pendingFills({ groups, teams, matches })
    if (!fills.length) return
    busy.current = true
    Promise.all(fills.map((f) => updateMatch(f.match.id, { [f.field]: f.teamId })))
      .then(() => {
        toast(`Into the knockouts: ${fills.map((f) => `${teamsById[f.teamId]?.name} → ${f.match.round_label}`).join(', ')}`)
        refresh()
      })
      .catch((e) => toast(e.message || 'Could not update the knockouts', 'error'))
      .finally(() => {
        busy.current = false
      })
  }, [enabled, groups, teams, teamsById, matches, refresh, toast])
}

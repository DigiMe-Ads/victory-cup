import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { listClubs, listTournaments } from '../lib/api'

// All age categories (with team/group counts) plus the clubs, kept live.
export function useTournaments() {
  const [tournaments, setTournaments] = useState([])
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const [ts, cs] = await Promise.all([listTournaments(), listClubs()])
      setTournaments(ts)
      setClubs(cs)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    let timer
    const onChange = () => {
      clearTimeout(timer)
      timer = setTimeout(refresh, 300)
    }
    let channel = supabase.channel(`tournaments-list-${Math.random().toString(36).slice(2)}`)
    for (const table of ['tournaments', 'clubs', 'groups', 'teams']) {
      channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, onChange)
    }
    channel.subscribe()
    return () => {
      clearTimeout(timer)
      supabase.removeChannel(channel)
    }
  }, [refresh])

  return { tournaments, clubs, loading, error, refresh }
}

export const countOf = (rel) => rel?.[0]?.count ?? 0

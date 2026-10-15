import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getTournamentBySlug, listClubs, listGroups, listMatches, listTeams } from '../lib/api'

// Loads one age category with its groups, teams, matches and clubs, kept live via realtime.
export function useTournamentData(slug) {
  const [tournament, setTournament] = useState(null)
  const [groups, setGroups] = useState([])
  const [rawTeams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const idRef = useRef(null)

  const refresh = useCallback(async () => {
    try {
      const t = await getTournamentBySlug(slug)
      setTournament(t)
      idRef.current = t?.id ?? null
      if (t) {
        const [gs, tm, ms, cs] = await Promise.all([listGroups(t.id), listTeams(t.id), listMatches(t.id), listClubs()])
        setGroups(gs)
        setTeams(tm)
        setMatches(ms)
        setClubs(cs)
      }
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    setLoading(true)
    refresh()
    let timer
    // Debounce bursts of changes (e.g. generating a whole fixture list).
    const onChange = (payload) => {
      const row = payload.new?.tournament_id ?? payload.old?.tournament_id
      if (row && idRef.current && row !== idRef.current) return
      clearTimeout(timer)
      timer = setTimeout(refresh, 250)
    }
    let channel = supabase.channel(`tournament-${slug}-${Math.random().toString(36).slice(2)}`)
    for (const table of ['matches', 'teams', 'groups', 'tournaments', 'clubs']) {
      channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, onChange)
    }
    channel.subscribe()
    return () => {
      clearTimeout(timer)
      supabase.removeChannel(channel)
    }
  }, [slug, refresh])

  const clubsById = useMemo(() => Object.fromEntries(clubs.map((c) => [c.id, c])), [clubs])

  // Teams with their club attached and the logo to show (team override → club logo).
  const teams = useMemo(
    () =>
      rawTeams.map((t) => {
        const club = clubsById[t.club_id] ?? null
        return { ...t, club, logo: t.logo_url || club?.logo_url || null }
      }),
    [rawTeams, clubsById],
  )
  const teamsById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams])
  const groupsById = useMemo(() => Object.fromEntries(groups.map((g) => [g.id, g])), [groups])

  return {
    tournament,
    groups,
    groupsById,
    teams,
    teamsById,
    matches,
    clubs,
    loading,
    error,
    refresh,
    setMatches,
    setTeams,
  }
}

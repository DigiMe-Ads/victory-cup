import { supabase } from './supabase'
import { logoFileName, prepareLogo } from './logo'

function unwrap({ data, error }) {
  if (error) throw error
  return data
}

// ── Tournaments (age categories) ───────────────────────────
export async function listTournaments() {
  return unwrap(
    await supabase
      .from('tournaments')
      .select('*, teams(count), groups(count)')
      .order('sort_order')
      .order('created_at'),
  )
}

export async function getTournamentBySlug(slug) {
  return unwrap(await supabase.from('tournaments').select('*').eq('slug', slug).maybeSingle())
}

export async function saveTournament(values) {
  const { id, teams: _t, groups: _g, created_at: _c, ...rest } = values
  const query = id
    ? supabase.from('tournaments').update(rest).eq('id', id)
    : supabase.from('tournaments').insert(rest)
  return unwrap(await query.select().single())
}

export async function setTournamentStatus(id, status) {
  return unwrap(await supabase.from('tournaments').update({ status }).eq('id', id))
}

export async function deleteTournament(id) {
  return unwrap(await supabase.from('tournaments').delete().eq('id', id))
}

// ── Clubs ──────────────────────────────────────────────────
export async function listClubs() {
  return unwrap(await supabase.from('clubs').select('*').order('sort_order').order('name'))
}

export async function saveClub(values) {
  const { id, created_at: _c, ...rest } = values
  const query = id ? supabase.from('clubs').update(rest).eq('id', id) : supabase.from('clubs').insert(rest)
  return unwrap(await query.select().single())
}

export async function deleteClub(id) {
  return unwrap(await supabase.from('clubs').delete().eq('id', id))
}

// ── Groups ─────────────────────────────────────────────────
export async function listGroups(tournamentId) {
  return unwrap(
    await supabase.from('groups').select('*').eq('tournament_id', tournamentId).order('sort_order').order('name'),
  )
}

export async function addGroups(rows) {
  return unwrap(await supabase.from('groups').insert(rows).select())
}

export async function updateGroup(id, values) {
  return unwrap(await supabase.from('groups').update(values).eq('id', id))
}

export async function deleteGroups(ids) {
  if (!ids.length) return null
  return unwrap(await supabase.from('groups').delete().in('id', ids))
}

// ── Teams ──────────────────────────────────────────────────
export async function listTeams(tournamentId) {
  return unwrap(await supabase.from('teams').select('*').eq('tournament_id', tournamentId).order('created_at'))
}

export async function addTeams(rows) {
  return unwrap(await supabase.from('teams').insert(rows).select())
}

export async function updateTeam(id, values) {
  return unwrap(await supabase.from('teams').update(values).eq('id', id))
}

export async function deleteTeam(id) {
  return unwrap(await supabase.from('teams').delete().eq('id', id))
}

// Puts a team into a draw slot. Whoever was there goes back to the pot first
// (a slot can only hold one team).
export async function placeTeam(teamId, groupId, slot, occupantId) {
  if (occupantId && occupantId !== teamId) await updateTeam(occupantId, { group_id: null, slot: null })
  if (teamId) await updateTeam(teamId, { group_id: null, slot: null })
  if (teamId) await updateTeam(teamId, { group_id: groupId, slot })
}

export async function clearDraw(tournamentId) {
  return unwrap(await supabase.from('teams').update({ group_id: null, slot: null }).eq('tournament_id', tournamentId))
}

// ── Team & club logos (Storage) ────────────────────────────
const LOGO_BUCKET = 'team-logos'

// Trims and shrinks an image, uploads it and returns its public URL.
export async function uploadTeamLogo(file) {
  const { blob, ext, light } = await prepareLogo(file)
  if (blob.size > 2 * 1024 * 1024) throw new Error('Logo must be under 2 MB')
  const path = logoFileName(crypto.randomUUID(), ext, light)
  unwrap(await supabase.storage.from(LOGO_BUCKET).upload(path, blob, { contentType: blob.type || file.type, cacheControl: '31536000' }))
  return supabase.storage.from(LOGO_BUCKET).getPublicUrl(path).data.publicUrl
}

// Best-effort cleanup of an uploaded logo that's no longer used.
export async function removeTeamLogo(url) {
  const path = url?.split(`/${LOGO_BUCKET}/`)[1]
  if (path) await supabase.storage.from(LOGO_BUCKET).remove([path])
}

// ── Matches ────────────────────────────────────────────────
export async function listMatches(tournamentId) {
  return unwrap(
    await supabase.from('matches').select('*').eq('tournament_id', tournamentId).order('match_no').order('pitch'),
  )
}

export async function addMatches(rows) {
  return unwrap(await supabase.from('matches').insert(rows).select())
}

export async function updateMatch(id, values) {
  return unwrap(await supabase.from('matches').update(values).eq('id', id))
}

export async function deleteMatch(id) {
  return unwrap(await supabase.from('matches').delete().eq('id', id))
}

export async function clearMatches(tournamentId, stage) {
  let q = supabase.from('matches').delete().eq('tournament_id', tournamentId)
  if (stage) q = q.eq('stage', stage)
  return unwrap(await q)
}

// ── Auth ───────────────────────────────────────────────────
export async function checkIsAdmin() {
  const { data, error } = await supabase.rpc('is_admin')
  if (error) return false
  return data === true
}

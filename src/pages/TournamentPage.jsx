import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { CalendarRange, LayoutGrid, Settings2, Users } from 'lucide-react'
import TournamentHeader from '../components/tournament/TournamentHeader'
import GroupsView from '../components/tournament/GroupsView'
import FixtureList from '../components/tournament/FixtureList'
import TeamsGrid from '../components/tournament/TeamsGrid'
import LiveBanner from '../components/tournament/LiveBanner'
import Tabs from '../components/ui/Tabs'
import Spinner from '../components/ui/Spinner'
import NotFound from './NotFound'
import { useTournamentData } from '../hooks/useTournamentData'
import { useTournaments } from '../hooks/useTournaments'
import { useAuth } from '../hooks/useAuth'

const TABS = [
  { id: 'groups', label: 'Groups', icon: LayoutGrid },
  { id: 'fixtures', label: 'Fixtures', icon: CalendarRange },
  { id: 'teams', label: 'Teams', icon: Users },
]

export default function TournamentPage() {
  const { slug } = useParams()
  const { isAdmin } = useAuth()
  const { tournament, groups, groupsById, teams, teamsById, matches, loading, error } = useTournamentData(slug)
  const { tournaments } = useTournaments()
  const [tab, setTab] = useState('groups')

  if (loading) return <Spinner />
  if (error) return <p className="mx-auto max-w-xl p-10 text-center text-red">{error}</p>
  if (!tournament) return <NotFound />

  return (
    <>
      <TournamentHeader tournament={tournament} siblings={tournaments} teamCount={teams.length} groupCount={groups.length} />

      <div className="mx-auto max-w-6xl px-4 pt-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          {isAdmin && (
            <Link
              to={`/admin/t/${tournament.slug}`}
              className="flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 font-bold text-white transition hover:bg-red"
            >
              <Settings2 className="size-4" /> Manage
            </Link>
          )}
        </div>

        {tournament.status !== 'closed' && <LiveBanner matches={matches} teamsById={teamsById} />}

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'groups' && <GroupsView groups={groups} teams={teams} matches={matches} />}
            {tab === 'fixtures' && (
              <FixtureList matches={matches} teamsById={teamsById} groups={groups} groupsById={groupsById} />
            )}
            {tab === 'teams' && <TeamsGrid teams={teams} groupsById={groupsById} single={groups.length === 1} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}

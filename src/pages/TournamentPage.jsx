import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { CalendarRange, LayoutGrid, Settings2, Trophy, Users } from 'lucide-react'
import TournamentHeader from '../components/tournament/TournamentHeader'
import GroupsView from '../components/tournament/GroupsView'
import FixtureList from '../components/tournament/FixtureList'
import TeamsGrid from '../components/tournament/TeamsGrid'
import LiveBanner from '../components/tournament/LiveBanner'
import KnockoutView from '../components/tournament/KnockoutView'
import Tabs from '../components/ui/Tabs'
import Spinner from '../components/ui/Spinner'
import NotFound from './NotFound'
import { useTournamentData } from '../hooks/useTournamentData'
import { useTournaments } from '../hooks/useTournaments'
import { useAuth } from '../hooks/useAuth'
import { KO_FORMATS } from '../lib/knockout'

const TABS = [
  { id: 'groups', label: 'Groups', icon: LayoutGrid },
  { id: 'knockouts', label: 'Knockouts', icon: Trophy },
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
  const format = KO_FORMATS[tournament.ko_format]

  return (
    <>
      <TournamentHeader
        tournament={tournament}
        siblings={tournaments}
        teamCount={teams.length}
        groupCount={groups.length}
        qualifyText={format?.qualify}
      />

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

        <>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'groups' && (
              <GroupsView groups={groups} teams={teams} matches={matches} qualify={format?.count ?? 0} qualifyText={format?.qualify} />
            )}
            {tab === 'knockouts' && (
              <KnockoutView
                tournament={tournament}
                matches={matches}
                teamsById={teamsById}
                groupsById={groupsById}
                single={groups.length === 1}
              />
            )}
            {tab === 'fixtures' && (
              <FixtureList matches={matches} teamsById={teamsById} groups={groups} groupsById={groupsById} />
            )}
            {tab === 'teams' && <TeamsGrid teams={teams} groupsById={groupsById} single={groups.length === 1} />}
          </motion.div>
        </>
      </div>
    </>
  )
}

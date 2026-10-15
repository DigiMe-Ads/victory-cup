import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, CalendarRange, Eye, LayoutGrid, Pencil, Trophy, Users } from 'lucide-react'
import TeamManager from '../../components/admin/TeamManager'
import GroupsAdmin from '../../components/admin/GroupsAdmin'
import FixtureBuilder from '../../components/admin/FixtureBuilder'
import ScoreBoard from '../../components/admin/ScoreBoard'
import StatusSwitch from '../../components/admin/StatusSwitch'
import TournamentForm from '../../components/admin/TournamentForm'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Tabs from '../../components/ui/Tabs'
import Spinner from '../../components/ui/Spinner'
import NotFound from '../NotFound'
import { useTournamentData } from '../../hooks/useTournamentData'
import { useAction } from '../../hooks/useToast'
import { saveTournament, setTournamentStatus } from '../../lib/api'
import { formatDate, formatTime } from '../../lib/format'

const TABS = [
  { id: 'teams', label: '1. Teams', icon: Users },
  { id: 'draw', label: '2. Groups & draw', icon: LayoutGrid },
  { id: 'fixtures', label: '3. Fixtures', icon: CalendarRange },
  { id: 'scores', label: '4. Live scores', icon: Trophy },
]

export default function AdminTournament() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const run = useAction()
  const data = useTournamentData(slug)
  const { tournament: t, loading, refresh } = data
  const [tab, setTab] = useState('draw')
  const [editing, setEditing] = useState(false)

  if (loading) return <Spinner />
  if (!t) return <NotFound />

  async function handleStatus(status) {
    if (status === 'closed' && !confirm(`Mark ${t.name} as completed?`)) return
    await run(() => setTournamentStatus(t.id, status), `Now ${status}`)
    refresh()
  }

  async function handleSave(values) {
    const saved = await run(() => saveTournament(values), 'Details saved')
    if (!saved) return
    setEditing(false)
    if (saved.slug !== slug) navigate(`/admin/t/${saved.slug}`, { replace: true })
    else refresh()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-bold text-navy/50 hover:text-red">
        <ArrowLeft className="size-4" /> All age groups
      </Link>

      <div className="mt-3 mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-cond text-sm font-bold tracking-[0.25em] text-red uppercase">
            {t.segment === 'girls' ? 'Girls only' : 'Boys & girls mixed'}
          </p>
          <h1 className="heading text-4xl sm:text-5xl">
            {t.age_group} · {t.name}
          </h1>
          <p className="mt-1 font-medium text-navy/60">
            {formatDate(t.event_date)} · from {formatTime(t.start_time) || 'TBA'} · {t.match_minutes} min matches · {t.pitches}{' '}
            pitch{t.pitches > 1 ? 'es' : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusSwitch value={t.status} onChange={handleStatus} layoutId="admin-status" />
          <Button variant="ghost" icon={Pencil} onClick={() => setEditing(true)}>
            Details
          </Button>
          <Link
            to={`/t/${t.slug}`}
            className="flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 font-semibold text-white transition hover:bg-red"
          >
            <Eye className="size-4" /> Public page
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <Tabs tabs={TABS} active={tab} onChange={setTab} layoutId="admin-tab" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'teams' && <TeamManager {...data} />}
          {tab === 'draw' && <GroupsAdmin {...data} />}
          {tab === 'fixtures' && <FixtureBuilder {...data} />}
          {tab === 'scores' && <ScoreBoard {...data} />}
        </motion.div>
      </AnimatePresence>

      <Modal open={editing} onClose={() => setEditing(false)} title="Age group details" wide>
        {editing && <TournamentForm initial={t} onSubmit={handleSave} onCancel={() => setEditing(false)} />}
      </Modal>
    </div>
  )
}

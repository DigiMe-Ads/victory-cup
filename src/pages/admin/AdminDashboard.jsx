import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Plus } from 'lucide-react'
import AdminTournamentRow from '../../components/admin/AdminTournamentRow'
import TournamentForm from '../../components/admin/TournamentForm'
import ClubManager from '../../components/admin/ClubManager'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import Tabs from '../../components/ui/Tabs'
import { useTournaments } from '../../hooks/useTournaments'
import { useAction } from '../../hooks/useToast'
import { deleteTournament, saveTournament, setTournamentStatus } from '../../lib/api'
import { SEGMENTS } from '../../lib/format'

const TABS = [
  { id: 'categories', label: 'Age groups' },
  { id: 'clubs', label: 'Clubs & logos' },
]

export default function AdminDashboard() {
  const { tournaments, clubs, loading, refresh } = useTournaments()
  const run = useAction()
  const [tab, setTab] = useState('categories')
  const [editing, setEditing] = useState(null) // null | {} (new) | tournament

  async function handleSave(values) {
    const ok = await run(() => saveTournament(values), values.id ? 'Age group updated' : 'Age group created')
    if (ok) {
      setEditing(null)
      refresh()
    }
  }

  async function handleStatus(t, status) {
    if (status === 'closed' && !confirm(`Mark ${t.name} as completed?`)) return
    await run(() => setTournamentStatus(t.id, status), `${t.name} is now ${status}`)
    refresh()
  }

  async function handleDelete(t) {
    if (!confirm(`Delete "${t.name}" with all its teams, groups and matches? This cannot be undone.`)) return
    await run(() => deleteTournament(t.id), 'Age group deleted')
    refresh()
  }

  const rowProps = { onStatus: handleStatus, onEdit: setEditing, onDelete: handleDelete }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-cond text-sm font-bold tracking-[0.25em] text-red uppercase">Admin</p>
          <h1 className="heading text-4xl sm:text-5xl">Victory Football Carnival</h1>
        </div>
        {tab === 'categories' && (
          <Button icon={Plus} onClick={() => setEditing({})}>
            New age group
          </Button>
        )}
      </div>

      <div className="mb-6">
        <Tabs tabs={TABS} active={tab} onChange={setTab} layoutId="admin-home-tab" />
      </div>

      {loading ? (
        <Spinner />
      ) : tab === 'clubs' ? (
        <ClubManager clubs={clubs} refresh={refresh} />
      ) : (
        SEGMENTS.map((seg) => {
          const list = tournaments.filter((t) => t.segment === seg.id)
          return (
            <section key={seg.id} className="mb-10">
              <h2 className="heading mb-3 text-xl text-navy/60">{seg.label}</h2>
              {list.length ? (
                <ul className="space-y-3">
                  <AnimatePresence>
                    {list.map((t) => (
                      <AdminTournamentRow key={t.id} tournament={t} {...rowProps} />
                    ))}
                  </AnimatePresence>
                </ul>
              ) : (
                <p className="card p-6 text-center text-navy/50">No age groups yet.</p>
              )}
            </section>
          )
        })
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit age group' : 'New age group'}
        wide
      >
        {editing !== null && (
          <TournamentForm initial={editing} onSubmit={handleSave} onCancel={() => setEditing(null)} />
        )}
      </Modal>
    </div>
  )
}

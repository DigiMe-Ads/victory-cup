import { Shuffle } from 'lucide-react'
import GroupCard from './GroupCard'
import TeamBadge from '../ui/TeamBadge'

// Public view of the draw: every group with its slots (fills in live on draw day).
export default function GroupsView({ groups, teams, matches, qualify = 0, qualifyText }) {
  const pot = teams.filter((t) => !t.group_id)

  if (!groups.length) {
    return (
      <div className="card p-8 text-center">
        <Shuffle className="mx-auto size-12 text-red" />
        <p className="heading mt-3 text-3xl">The draw is coming soon</p>
        <p className="mt-1 text-navy/60">Groups appear here live as each team is drawn into its slot.</p>
        <PotList teams={teams} title="Teams in the draw" />
      </div>
    )
  }

  const single = groups.length === 1
  return (
    <div className="space-y-6">
      <div className={`grid gap-5 ${single ? '' : 'md:grid-cols-2'} ${groups.length > 2 ? 'xl:grid-cols-3' : ''}`}>
        {groups.map((g, i) => (
          <GroupCard key={g.id} group={g} teams={teams} matches={matches} single={single} index={i} qualify={qualify} qualifyText={qualifyText} />
        ))}
      </div>
      {pot.length > 0 && (
        <div className="card p-5">
          <PotList teams={pot} title={`Still to be drawn (${pot.length})`} />
        </div>
      )}
    </div>
  )
}

function PotList({ teams, title }) {
  if (!teams.length) return null
  return (
    <div className="mt-2 text-left">
      <p className="mb-3 font-cond text-sm font-bold tracking-widest text-navy/50 uppercase">{title}</p>
      <div className="flex flex-wrap gap-2">
        {teams.map((t) => (
          <span key={t.id} className="flex items-center gap-2 rounded-full border border-navy/10 bg-white py-1 pr-3 pl-1 text-sm font-semibold">
            <TeamBadge team={t} size="xs" /> {t.name}
          </span>
        ))}
      </div>
    </div>
  )
}

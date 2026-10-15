import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Shuffle, Users } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'
import { countOf } from '../../hooks/useTournaments'

// One age category tile, e.g. "U12 · Boys & girls".
export default function CategoryCard({ tournament: t, index = 0 }) {
  const teams = countOf(t.teams)
  const groups = countOf(t.groups)
  const girls = t.segment === 'girls'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
    >
      <Link
        to={`/t/${t.slug}`}
        className="tile group relative flex h-full flex-col overflow-hidden p-5 transition hover:-translate-y-1 hover:shadow-[0_0_0_2px_#e3202e,0_14px_30px_-12px_rgb(19_38_110/0.5)]"
      >
        <span className={`absolute -top-6 -right-8 h-24 w-28 rotate-12 ${girls ? 'bg-red' : 'bg-navy'}`} />
        <span className={`absolute top-6 -right-6 h-4 w-24 rotate-12 ${girls ? 'bg-navy' : 'bg-red'}`} />
        <span className="relative font-cond text-sm font-bold tracking-widest text-navy/50 uppercase">
          {girls ? 'Girls only' : 'Boys & girls'}
        </span>
        <p className="heading relative mt-1 text-6xl leading-none text-navy">{t.age_group || t.name}</p>
        <p className="relative mt-1 font-semibold text-navy/70">{t.name}</p>

        <div className="relative mt-4 flex flex-wrap items-center gap-2 text-sm font-semibold">
          <span className="flex items-center gap-1 rounded-full bg-navy/5 px-2.5 py-1">
            <Users className="size-3.5" /> {teams} teams
          </span>
          <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${groups ? 'bg-navy/5' : 'bg-sun/40'}`}>
            <Shuffle className="size-3.5" /> {groups ? `${groups} group${groups > 1 ? 's' : ''}` : 'Draw pending'}
          </span>
          {t.status !== 'upcoming' && <StatusBadge status={t.status} />}
        </div>

        <span className="relative mt-auto flex items-center gap-1 pt-5 font-cond text-lg font-bold tracking-wide text-red uppercase">
          Groups &amp; fixtures <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </span>
      </Link>
    </motion.div>
  )
}

import { HeartHandshake, Medal, Trophy, Users } from 'lucide-react'
import Hero from '../components/home/Hero'
import CategoryCard from '../components/home/CategoryCard'
import ClubWall from '../components/home/ClubWall'
import SectionTitle from '../components/home/SectionTitle'
import Spinner from '../components/ui/Spinner'
import { useTournaments } from '../hooks/useTournaments'
import { SEGMENTS } from '../lib/format'
import { VALUES } from '../data/info'

const ICONS = { Trophy, Medal, Users, HeartHandshake }

export default function Home() {
  const { tournaments, clubs, loading, error } = useTournaments()

  return (
    <>
      <Hero />

      <div className="bg-navy text-white">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 divide-white/15 px-4 py-3 sm:grid-cols-4 sm:divide-x">
          {VALUES.map(({ icon, label }) => {
            const Icon = ICONS[icon]
            return (
              <li key={label} className="flex items-center justify-center gap-2 py-2 font-cond text-lg font-bold tracking-wide uppercase">
                <Icon className="size-6" /> {label}
              </li>
            )
          })}
        </ul>
      </div>

      <section id="categories" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-14">
        {loading && <Spinner label="Warming up…" />}
        {error && <p className="card p-6 text-red">Couldn't load the tournament: {error}</p>}
        {!loading &&
          !error &&
          SEGMENTS.map((seg) => {
            const list = tournaments.filter((t) => t.segment === seg.id)
            if (!list.length) return null
            return (
              <div key={seg.id} className="mb-12">
                <SectionTitle kicker="Pick an age group" title={seg.label} />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {list.map((t, i) => (
                    <CategoryCard key={t.id} tournament={t} index={i} />
                  ))}
                </div>
              </div>
            )
          })}
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-6">
        <SectionTitle kicker="The line-up" title="Participating clubs" />
        <ClubWall clubs={clubs} />
      </section>
    </>
  )
}

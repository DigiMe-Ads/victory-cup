import { Link } from 'react-router-dom'
import { CalendarDays, Clock, MapPin, Trophy } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'
import { formatDate, formatTime } from '../../lib/format'

// Navy banner for one age category, with quick links to the other categories.
export default function TournamentHeader({ tournament: t, siblings = [], teamCount, groupCount, qualifyText }) {
  const girls = t.segment === 'girls'
  return (
    <header className="relative overflow-hidden bg-navy text-white">
      <div className="absolute -top-10 -right-24 h-64 w-96 rotate-[20deg] bg-red/90" />
      <div className="absolute top-40 -right-20 h-6 w-96 rotate-[20deg] bg-white/15" />
      <div className="absolute -bottom-24 -left-20 h-48 w-80 rotate-[20deg] bg-navy-light" />

      <div className="relative mx-auto max-w-6xl px-4 pt-8 pb-10">
        {siblings.length > 1 && (
          <nav className="no-scrollbar mb-6 flex gap-1.5 overflow-x-auto pb-1" aria-label="Age groups">
            {siblings.map((s) => (
              <Link
                key={s.id}
                to={`/t/${s.slug}`}
                className={`shrink-0 rounded-lg px-3 py-1.5 font-cond text-base font-bold tracking-wide uppercase transition ${
                  s.id === t.id ? 'bg-white text-navy' : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {s.age_group}
                {s.segment === 'girls' && <span className="ml-1 text-red">Girls</span>}
              </Link>
            ))}
          </nav>
        )}

        <p className="font-cond text-sm font-bold tracking-[0.25em] text-white/60 uppercase">
          {t.season} · {girls ? 'Girls only' : 'Boys & girls mixed'}
        </p>
        <div className="mt-1 flex flex-wrap items-end gap-x-5 gap-y-2">
          <h1 className="heading text-7xl leading-none sm:text-8xl">{t.age_group}</h1>
          <div className="pb-2">
            <p className="heading text-2xl sm:text-3xl">
              {t.name} {girls && <span className="text-red">· Girls</span>}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <StatusBadge status={t.status} className={t.status === 'upcoming' ? 'bg-white! text-navy!' : ''} />
              <span className="text-sm font-semibold text-white/70">
                {teamCount} teams{groupCount ? ` · ${groupCount} group${groupCount > 1 ? 's' : ''}` : ''}
              </span>
            </div>
          </div>
        </div>

        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-cond text-lg font-semibold text-white/90">
          <li className="flex items-center gap-2"><CalendarDays className="size-5 text-red" /> {formatDate(t.event_date)}</li>
          {t.start_time && <li className="flex items-center gap-2"><Clock className="size-5 text-red" /> From {formatTime(t.start_time)}</li>}
          {t.venue && <li className="flex items-center gap-2"><MapPin className="size-5 text-red" /> {t.venue}</li>}
          {qualifyText && <li className="flex items-center gap-2"><Trophy className="size-5 text-sun" /> {qualifyText}</li>}
        </ul>
        {t.description && <p className="mt-3 max-w-2xl text-white/70">{t.description}</p>}
      </div>
    </header>
  )
}

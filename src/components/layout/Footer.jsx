import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { EVENT } from '../../data/info'

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-navy-dark text-white">
      <div className="absolute -top-16 -left-10 h-40 w-[140%] -rotate-3 bg-red/90" style={{ clipPath: 'polygon(0 60%, 100% 0, 100% 30%, 0 100%)' }} />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pt-16 pb-12 md:grid-cols-[auto_1fr_auto] md:items-center">
        <img src="/logos/victory.png" alt="Victory Football School" className="h-28 w-auto object-contain drop-shadow-xl" />
        <div>
          <p className="heading text-3xl">
            {EVENT.name.replace(' 2026', '')} <span className="text-red">2026</span>
          </p>
          <p className="mt-2 max-w-md text-white/70">
            Organised by {EVENT.organiser} for the {EVENT.edition}.
          </p>
        </div>
        <ul className="space-y-2 font-cond text-lg font-semibold">
          <li className="flex items-center gap-2"><CalendarDays className="size-5 text-red" /> {EVENT.dateLabel}</li>
          <li className="flex items-center gap-2"><MapPin className="size-5 text-red" /> {EVENT.venue}</li>
          <li className="flex items-center gap-2"><Clock className="size-5 text-red" /> {EVENT.time}</li>
        </ul>
      </div>
      <p className="relative border-t border-white/10 py-5 text-center text-sm text-white/50">
        © {new Date().getFullYear()} {EVENT.organiser}
      </p>
    </footer>
  )
}

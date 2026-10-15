import { motion } from 'motion/react'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { EVENT } from '../../data/info'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="shards" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-4 pt-10 pb-8 md:grid-cols-[1.1fr_1fr] md:pt-14">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <img src="/logos/victory.png" alt="Victory Football School" className="mb-3 h-24 w-auto drop-shadow-md sm:h-28" />
          <h1 className="heading leading-[0.9]">
            <span className="block text-6xl text-navy sm:text-7xl lg:text-8xl">Football</span>
            <span className="block text-6xl text-red sm:text-7xl lg:text-8xl">Carnival</span>
          </h1>
          <p className="heading mt-2 flex items-center gap-3 text-4xl text-navy sm:text-5xl">
            <span className="streak flip" /> 2026 <span className="streak" />
          </p>
          <p className="mt-4 max-w-md font-cond text-xl font-semibold text-navy/70">
            Organised by {EVENT.organiser} for the {EVENT.edition}.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:max-w-md">
            <InfoRow icon={CalendarDays} label="Date" value={EVENT.dateLabel} tone="sun" />
            <InfoRow icon={MapPin} label="Venue" value={EVENT.venue} tone="navy" />
            <InfoRow icon={Clock} label="Time" value={EVENT.time} tone="red" />
          </div>

          <a
            href="#categories"
            className="slant mt-8 inline-flex bg-red px-7 py-3.5 shadow-[6px_6px_0_0_#13266e] transition hover:-translate-y-0.5"
          >
            <span className="heading text-xl text-white">Groups &amp; fixtures →</span>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative hidden md:block"
        >
          <img
            src="/players.webp"
            alt="Young players chasing the ball"
            className="mx-auto max-h-[560px] w-auto"
            style={{ maskImage: 'radial-gradient(ellipse 62% 66% at 52% 46%, #000 55%, transparent 100%)' }}
          />
        </motion.div>
      </div>
    </section>
  )
}

const TONES = {
  sun: 'bg-sun text-navy',
  navy: 'bg-navy text-white',
  red: 'bg-red text-white',
}

function InfoRow({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${tone === 'sun' ? 'bg-red' : 'bg-navy'} text-white`}>
        <Icon className="size-6" />
      </span>
      <div className={`slant flex-1 px-4 py-1.5 ${TONES[tone]}`}>
        <span className="block font-cond text-xs font-bold tracking-widest uppercase opacity-80">{label}</span>
        <span className="heading block text-xl leading-tight sm:text-2xl">{value}</span>
      </div>
    </div>
  )
}

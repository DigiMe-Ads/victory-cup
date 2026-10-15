import { motion } from 'motion/react'

const OPTIONS = [
  { id: 'upcoming', label: 'Upcoming', active: 'bg-sky text-white' },
  { id: 'live', label: 'Live', active: 'bg-red text-white' },
  { id: 'closed', label: 'Closed', active: 'bg-navy text-white' },
]

export default function StatusSwitch({ value, onChange, layoutId }) {
  return (
    <div className="inline-flex rounded-2xl bg-navy/5 p-1">
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => value !== o.id && onChange(o.id)}
          className={`relative cursor-pointer rounded-xl px-3 py-1.5 text-sm font-bold transition-colors ${
            value === o.id ? '' : 'text-navy/50 hover:text-navy'
          }`}
        >
          {value === o.id && (
            <motion.span layoutId={layoutId} className={`absolute inset-0 rounded-xl ${o.active}`} />
          )}
          <span className={`relative ${value === o.id ? o.active.split(' ')[1] : ''}`}>{o.label}</span>
        </button>
      ))}
    </div>
  )
}

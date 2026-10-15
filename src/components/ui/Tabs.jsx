import { motion } from 'motion/react'

export default function Tabs({ tabs, active, onChange, layoutId = 'tab-pill' }) {
  return (
    <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-navy/10">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`relative flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 font-cond text-base font-bold tracking-wide whitespace-nowrap uppercase transition-colors sm:text-lg ${
            active === id ? 'text-white' : 'text-navy/60 hover:text-red'
          }`}
        >
          {active === id && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-lg bg-navy"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          {Icon && <Icon className="relative size-4" strokeWidth={2.5} />}
          <span className="relative">{label}</span>
        </button>
      ))}
    </div>
  )
}

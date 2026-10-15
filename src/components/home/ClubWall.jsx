import { motion } from 'motion/react'

// The participating clubs, shown like the logo tiles on the banner.
export default function ClubWall({ clubs }) {
  if (!clubs.length) return null
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {clubs.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.04 }}
          className="tile flex flex-col items-center gap-2 p-4 text-center"
        >
          <div className="grid aspect-square w-full max-w-28 place-items-center">
            {c.logo_url ? (
              <img src={c.logo_url} alt={c.name} className="max-h-full max-w-full object-contain" loading="lazy" />
            ) : (
              <span className="heading text-3xl text-navy/30">{c.short_name}</span>
            )}
          </div>
          <span className="text-sm leading-tight font-semibold text-navy/80">{c.name}</span>
        </motion.div>
      ))}
    </div>
  )
}

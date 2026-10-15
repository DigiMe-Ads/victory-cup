import { motion } from 'motion/react'
import Ball from './Ball'

export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-navy/60">
      <motion.div
        animate={{ y: [0, -28, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Ball className="size-12" />
      </motion.div>
      <motion.div
        className="h-1.5 w-10 rounded-full bg-navy/15"
        animate={{ scaleX: [1, 0.6, 1] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <p className="font-semibold">{label}</p>
    </div>
  )
}

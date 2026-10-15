import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import Ball from '../components/ui/Ball'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <motion.div
        animate={{ x: [0, 120, -120, 0], rotate: [0, 360, -360, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Ball className="size-20" />
      </motion.div>
      <h1 className="mt-6 heading text-5xl">Offside!</h1>
      <p className="mt-2 text-navy/60">We couldn't find that page. The ball went out of play.</p>
      <Link to="/" className="mt-6 rounded-2xl bg-red px-6 py-3 font-bold text-white shadow-[0_4px_0_0_#8f0e18]">
        Back to kick-off
      </Link>
    </div>
  )
}

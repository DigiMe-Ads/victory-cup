import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { LayoutDashboard, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      className="sticky top-0 z-40 border-b border-navy/10 bg-white/90 backdrop-blur-md"
    >
      <div className="h-1 bg-gradient-to-r from-navy via-navy to-red" />
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
        <Link to="/" className="group flex items-center gap-2.5">
          <img
            src="/logos/victory.png"
            alt="Victory Football School"
            className="h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
          />
          <span className="leading-none">
            <span className="heading block text-lg text-navy sm:text-xl">
              Victory <span className="text-red">Football</span> Carnival
            </span>
            <span className="font-cond text-xs font-bold tracking-widest text-navy/50 uppercase">2026 · Police Park</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <NavItem to="/">Home</NavItem>
          {isAdmin && (
            <NavItem to="/admin">
              <LayoutDashboard className="size-4" /> <span className="hidden sm:inline">Admin</span>
            </NavItem>
          )}
          {user ? (
            <button
              onClick={handleSignOut}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm font-bold text-white transition hover:bg-red"
              aria-label="Log out"
            >
              <LogOut className="size-4" /> <span className="hidden sm:inline">Log out</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-navy/50 transition hover:text-red"
            >
              <LogIn className="size-4" /> <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
        </div>
      </nav>
    </motion.header>
  )
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition ${
          isActive ? 'bg-ice text-navy' : 'text-navy/70 hover:text-red'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

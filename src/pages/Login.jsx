import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { LogIn } from 'lucide-react'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn, user, isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && user && isAdmin) return <Navigate to={location.state?.from || '/admin'} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await signIn(email.trim(), password)
    setBusy(false)
    if (error) setError(error.message)
    else navigate(location.state?.from || '/admin', { replace: true })
  }

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-16">
      <div className="absolute -left-20 top-10 size-72 rounded-full bg-red/20 blur-3xl" />
      <div className="absolute -right-20 bottom-10 size-72 rounded-full bg-sky/20 blur-3xl" />
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 16 }}
        className="card relative w-full max-w-md p-8"
      >
        <img src="/logos/victory.png" alt="Victory Football School" className="mx-auto mb-4 h-28 w-auto object-contain" />
        <h1 className="text-center heading text-3xl">Organiser login</h1>
        <p className="mt-1 text-center text-navy/60">Manage teams, fixtures and live scores.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <motion.p
              initial={{ x: -8 }}
              animate={{ x: [8, -6, 4, 0] }}
              className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red"
            >
              {error}
            </motion.p>
          )}
          <Button type="submit" size="lg" icon={LogIn} className="w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Log in'}
          </Button>
        </div>
      </motion.form>
    </div>
  )
}

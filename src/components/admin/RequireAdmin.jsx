import { Link, Navigate, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Spinner from '../ui/Spinner'

export default function RequireAdmin({ children }) {
  const { user, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner label="Checking your pass…" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShieldAlert className="mx-auto size-14 text-red" />
        <h1 className="mt-4 heading text-3xl">Admins only</h1>
        <p className="mt-2 text-navy/60">
          You're signed in as <b>{user.email}</b>, but this account isn't on the admin list.
        </p>
        <Link to="/" className="mt-6 inline-block font-bold text-red">
          ← Back home
        </Link>
      </div>
    )
  }
  return children
}

import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { lazy, Suspense } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import RequireAdmin from './components/admin/RequireAdmin'
import Home from './pages/Home'
import TournamentPage from './pages/TournamentPage'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Spinner from './components/ui/Spinner'

// Admin screens load on demand so visitors get a lighter bundle.
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminTournament = lazy(() => import('./pages/admin/AdminTournament'))

export default function App() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo({ top: 0 })}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <Suspense fallback={<Spinner />}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/t/:slug" element={<TournamentPage />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/admin"
                  element={
                    <RequireAdmin>
                      <AdminDashboard />
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/admin/t/:slug"
                  element={
                    <RequireAdmin>
                      <AdminTournament />
                    </RequireAdmin>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

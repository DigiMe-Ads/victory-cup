import { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

const ToastContext = createContext(() => {})

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex flex-col items-end gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60 }}
              className={`flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold text-white shadow-xl ${
                t.type === 'error' ? 'bg-red-600' : 'bg-navy'
              }`}
            >
              {t.type === 'error' ? (
                <AlertTriangle className="size-5" />
              ) : (
                <CheckCircle2 className="size-5 text-mint" />
              )}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

// Wraps an async admin action with success/error toasts.
export function useAction() {
  const toast = useToast()
  return useCallback(
    async (fn, success) => {
      try {
        const result = await fn()
        if (success) toast(success)
        return result
      } catch (e) {
        const msg = e.message || 'Something went wrong'
        toast(/row-level security/i.test(msg) ? 'Not allowed: please log in with an admin account' : msg, 'error')
        return undefined
      }
    },
    [toast],
  )
}

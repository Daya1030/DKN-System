import React, { createContext, useCallback, useContext, useState } from 'react'

type Toast = { id: string; message: string }

const ToastContext = createContext<{ push: (m: string) => void } | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((message: string) => {
    const t = { id: String(Date.now()) + Math.random().toString(16).slice(2), message }
    setToasts(s => [t, ...s])
    setTimeout(() => setToasts(s => s.filter(x => x.id !== t.id)), 4500)
  }, [])

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div aria-live="polite" style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 999 }}>
        {toasts.map(t => (
          <div key={t.id} className="card" style={{ marginBottom: 8 }}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(){
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

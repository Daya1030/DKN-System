import React, { createContext, useContext, useState } from 'react'

export type Role = 'NewHire' | 'Consultant' | 'KnowledgeChampion' | 'Administrator'

type User = { id: string; name: string; country: string; email: string; role: Role }

type AuthState = {
  user?: User | null
  role: Role
  country: string
  setRole: (r: Role) => void
  setCountry: (c: string) => void
  login: (name: string, email: string, country: string, role: Role) => void
  logout: () => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>(() => {
    try { return (localStorage.getItem('dkn:role') as Role) || 'NewHire' } catch { return 'NewHire' }
  })

  const [country, setCountry] = useState<string>(() => {
    try { return localStorage.getItem('dkn:country') || 'USA' } catch { return 'USA' }
  })

  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('dkn:user')
      return raw ? JSON.parse(raw) as User : null
    } catch { return null }
  })

  function login(name: string, email: string, country: string, userRole: Role) {
    const u = { id: String(Date.now()), name, email, country, role: userRole }
    setUser(u)
    setRole(userRole)
    try { 
      localStorage.setItem('dkn:user', JSON.stringify(u))
      localStorage.setItem('dkn:country', country)
      localStorage.setItem('dkn:role', userRole)
    } catch {}
  }

  function logout() {
    setUser(null)
    setRole('NewHire')
    try { 
      localStorage.removeItem('dkn:user')
      localStorage.removeItem('dkn:role')
    } catch {}
  }

  React.useEffect(() => { try { localStorage.setItem('dkn:role', role) } catch {} }, [role])
  React.useEffect(() => { try { localStorage.setItem('dkn:country', country) } catch {} }, [country])

  const state: AuthState = { user, role, country, setRole, setCountry, login, logout }
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

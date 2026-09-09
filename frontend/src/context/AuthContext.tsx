import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

interface AuthUser {
  username: string
  role: string
  tenant_id: number | null
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return {}
  }
}

function userFromStorage(): AuthUser | null {
  const token = localStorage.getItem('access_token')
  const username = localStorage.getItem('username')
  if (!token || !username) return null
  const payload = decodeJwtPayload(token)
  return {
    username,
    role: (payload.role as string) ?? '',
    tenant_id: (payload.tenant_id as number | null) ?? null,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(userFromStorage)

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('username')
    setUser(null)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await axios.post('/api/token/', { username, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    localStorage.setItem('username', username)
    const payload = decodeJwtPayload(data.access)
    setUser({
      username,
      role: (payload.role as string) ?? '',
      tenant_id: (payload.tenant_id as number | null) ?? null,
    })
  }, [])

  useEffect(() => {
    if (!localStorage.getItem('access_token')) setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

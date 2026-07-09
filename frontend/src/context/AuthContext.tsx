import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

interface AuthUser {
  username: string
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const username = localStorage.getItem('username')
    const token = localStorage.getItem('access_token')
    return username && token ? { username } : null
  })

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
    setUser({ username })
  }, [])

  // Clear stale state if tokens are gone (e.g. manual localStorage clear)
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

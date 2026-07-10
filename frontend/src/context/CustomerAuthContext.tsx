import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { CustomerProfile } from '../api/customerApi'

interface CustomerAuthState {
  customer: CustomerProfile | null
  isLoggedIn: boolean
  login: (tokens: { access: string; refresh: string }, profile: CustomerProfile) => void
  logout: () => void
  setCustomer: (c: CustomerProfile) => void
}

const CustomerAuthContext = createContext<CustomerAuthState | null>(null)

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomerState] = useState<CustomerProfile | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('customer_profile')
    if (raw) {
      try { setCustomerState(JSON.parse(raw)) } catch { /* ignore */ }
    }
  }, [])

  function login(tokens: { access: string; refresh: string }, profile: CustomerProfile) {
    localStorage.setItem('customer_access', tokens.access)
    localStorage.setItem('customer_refresh', tokens.refresh)
    localStorage.setItem('customer_profile', JSON.stringify(profile))
    setCustomerState(profile)
  }

  function logout() {
    localStorage.removeItem('customer_access')
    localStorage.removeItem('customer_refresh')
    localStorage.removeItem('customer_profile')
    setCustomerState(null)
  }

  function setCustomer(c: CustomerProfile) {
    localStorage.setItem('customer_profile', JSON.stringify(c))
    setCustomerState(c)
  }

  return (
    <CustomerAuthContext.Provider
      value={{ customer, isLoggedIn: !!customer, login, logout, setCustomer }}
    >
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) throw new Error('useCustomerAuth must be inside CustomerAuthProvider')
  return ctx
}

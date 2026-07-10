import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import client from '../api/client'

export interface Branding {
  business_name: string
  logo_url: string
  primary_color: string
  accent_color: string
  bg_color: string
}

const DEFAULTS: Branding = {
  business_name: 'Dulceras Team',
  logo_url: '',
  primary_color: '#3D1A0E',
  accent_color: '#E8889A',
  bg_color: '#FDF6EC',
}

const BrandingContext = createContext<Branding>(DEFAULTS)

export function useBranding() {
  return useContext(BrandingContext)
}

function applyBranding(b: Branding) {
  const root = document.documentElement
  root.style.setProperty('--color-chocolate', b.primary_color)
  root.style.setProperty('--color-rose', b.accent_color)
  root.style.setProperty('--color-cream', b.bg_color)
}

export function BrandingProvider({ tenant, children }: { tenant: string; children: ReactNode }) {
  const [branding, setBranding] = useState<Branding>(DEFAULTS)

  useEffect(() => {
    client.get<Branding>(`/api/public/${tenant}/branding/`)
      .then(r => {
        setBranding(r.data)
        applyBranding(r.data)
      })
      .catch(() => applyBranding(DEFAULTS))

    return () => {
      // Reset to defaults when leaving the public tenant pages
      applyBranding(DEFAULTS)
    }
  }, [tenant])

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  )
}

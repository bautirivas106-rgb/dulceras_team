import adminClient from './adminClient'

export interface TenantSettings {
  name: string
  slug: string
  address: string
  phone: string
  email: string
  whatsapp: string
  instagram: string
  advance_hours_required: number
  deposit_percentage: string
  max_orders_per_day: number
}

export const getSettings = () =>
  adminClient.get<TenantSettings>('/api/admin/settings/')

export const updateSettings = (data: Partial<Omit<TenantSettings, 'slug'>>) =>
  adminClient.patch<TenantSettings>('/api/admin/settings/', data)

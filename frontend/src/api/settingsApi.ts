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

export interface DeliveryZone {
  id: number
  name: string
  description: string
  price: string
  is_active: boolean
}

export const getSettings = () =>
  adminClient.get<TenantSettings>('/api/admin/settings/')

export const updateSettings = (data: Partial<Omit<TenantSettings, 'slug'>>) =>
  adminClient.patch<TenantSettings>('/api/admin/settings/', data)

export const getDeliveryZones = () =>
  adminClient.get<DeliveryZone[]>('/api/admin/delivery-zones/')

export const createDeliveryZone = (data: Omit<DeliveryZone, 'id'>) =>
  adminClient.post<DeliveryZone>('/api/admin/delivery-zones/', data)

export const updateDeliveryZone = (id: number, data: Partial<DeliveryZone>) =>
  adminClient.patch<DeliveryZone>(`/api/admin/delivery-zones/${id}/`, data)

export const deleteDeliveryZone = (id: number) =>
  adminClient.delete(`/api/admin/delivery-zones/${id}/`)

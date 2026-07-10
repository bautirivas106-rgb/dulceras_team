import adminClient from './adminClient'

export interface TenantProfile {
  address: string
  phone: string
  email: string
  whatsapp: string
  instagram: string
  advance_hours_required: number
  deposit_percentage: string
  max_orders_per_day: number
}

export interface SuperadminTenant {
  id: number
  name: string
  slug: string
  is_active: boolean
  profile: TenantProfile | null
  order_count: number | null
  user_count: number | null
  created_at: string
}

export interface TenantDetail extends SuperadminTenant {
  users: TenantUser[]
  revenue: number
}

export interface TenantUser {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
  date_joined: string
}

export interface PlatformMetrics {
  total_tenants: number
  active_tenants: number
  total_orders: number
  total_revenue: number
  total_users: number
  by_tenant: { id: number; name: string; slug: string; is_active: boolean; orders: number }[]
}

export interface TenantCreatePayload {
  name: string
  slug: string
  address?: string
  phone?: string
  email?: string
  whatsapp?: string
  instagram?: string
  admin_username: string
  admin_password: string
  admin_email?: string
}

const BASE = '/api/superadmin/tenants'

export const getTenants = () =>
  adminClient.get<SuperadminTenant[]>(`${BASE}/`)

export const getTenant = (id: number) =>
  adminClient.get<TenantDetail>(`${BASE}/${id}/`)

export const createTenant = (data: TenantCreatePayload) =>
  adminClient.post<{ tenant: SuperadminTenant; admin_username: string }>(`${BASE}/`, data)

export const toggleTenant = (id: number) =>
  adminClient.post<{ is_active: boolean }>(`${BASE}/${id}/toggle/`)

export const updateTenantProfile = (id: number, data: Partial<TenantProfile>) =>
  adminClient.patch<TenantProfile>(`${BASE}/${id}/profile/`, data)

export const addTenantUser = (
  tenantId: number,
  data: { username: string; password: string; email?: string; role: string }
) => adminClient.post<TenantUser>(`${BASE}/${tenantId}/users/`, data)

export const getMetrics = () =>
  adminClient.get<PlatformMetrics>(`${BASE}/metrics/`)

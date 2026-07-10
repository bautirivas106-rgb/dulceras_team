import client from './client'

export interface PublicPlan {
  id: number
  name: string
  slug: string
  price_monthly: string
  description: string
  max_products: number
  max_users: number
  max_orders_per_day: number
  has_mp_integration: boolean
  has_whatsapp: boolean
}

export interface RegisterPayload {
  name: string
  slug: string
  phone?: string
  email?: string
  whatsapp?: string
  admin_username: string
  admin_password: string
  admin_email?: string
  plan_id?: number | null
}

export interface RegisterResult {
  tenant_name: string
  tenant_slug: string
  admin_username: string
}

export const getPublicPlans = () =>
  client.get<PublicPlan[]>('/api/plans/')

export const registerTenant = (data: RegisterPayload) =>
  client.post<RegisterResult>('/api/register/', data)

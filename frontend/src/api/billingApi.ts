import adminClient from './adminClient'

export interface Subscription {
  id: number
  status: 'trial' | 'active' | 'overdue' | 'cancelled'
  plan_name: string | null
  plan_price: string | null
  trial_ends_at: string | null
  current_period_end: string | null
  days_remaining: number | null
}

export interface PayBillingResult {
  init_point: string | null
  sandbox_init_point: string | null
  amount: string
}

export const getBilling = () =>
  adminClient.get<Subscription>('/api/admin/billing/')

export const payBilling = () =>
  adminClient.post<PayBillingResult>('/api/admin/billing/')

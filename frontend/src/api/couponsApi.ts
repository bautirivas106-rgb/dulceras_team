import client from './client'
import adminClient from './adminClient'

export interface CouponValidateResult {
  valid: boolean
  error?: string
  code?: string
  discount_type?: 'percentage' | 'fixed'
  discount_value?: string
  discount_amount?: number
  final_subtotal?: number
}

export interface Coupon {
  id: number
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: string
  min_order_amount: string
  max_uses: number
  uses_count: number
  valid_from: string | null
  valid_until: string | null
  is_active: boolean
  created_at: string
}

export type CouponPayload = Omit<Coupon, 'id' | 'uses_count' | 'created_at'>

export const validateCoupon = (tenantSlug: string, code: string, subtotal: number) =>
  client.post<CouponValidateResult>(`/api/public/${tenantSlug}/coupons/validate/`, { code, subtotal })
    .then(r => r.data)

export const getCoupons = () =>
  adminClient.get<Coupon[]>('/api/admin/coupons/').then(r => r.data)

export const createCoupon = (data: CouponPayload) =>
  adminClient.post<Coupon>('/api/admin/coupons/', data).then(r => r.data)

export const updateCoupon = (id: number, data: Partial<CouponPayload>) =>
  adminClient.patch<Coupon>(`/api/admin/coupons/${id}/`, data).then(r => r.data)

export const deleteCoupon = (id: number) =>
  adminClient.delete(`/api/admin/coupons/${id}/`)

export const toggleCoupon = (id: number) =>
  adminClient.post<Coupon>(`/api/admin/coupons/${id}/toggle/`).then(r => r.data)

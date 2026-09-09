import client from './client'
import customerClient from './customerClient'

const TENANT = 'dulceras-team'

export interface CustomerProfile {
  id: number
  name: string
  phone: string
  email: string
  created_at: string
}

export interface CustomerTokens {
  access: string
  refresh: string
}

export interface CustomerAuthResult {
  tokens: CustomerTokens
  customer: CustomerProfile
}

export const customerRegister = (data: {
  name: string
  phone: string
  email: string
  password: string
}) =>
  client.post<CustomerAuthResult>(
    `/api/public/${TENANT}/customers/register/`,
    data
  ).then(r => r.data)

export const customerLogin = (email: string, password: string) =>
  client.post<CustomerAuthResult>(
    `/api/public/${TENANT}/customers/login/`,
    { email, password }
  ).then(r => r.data)

export const getCustomerProfile = () =>
  customerClient.get<CustomerProfile>(
    `/api/public/${TENANT}/customers/me/`
  ).then(r => r.data)

export const updateCustomerProfile = (data: { name?: string; phone?: string }) =>
  customerClient.patch<CustomerProfile>(
    `/api/public/${TENANT}/customers/me/`,
    data
  ).then(r => r.data)

export const getCustomerOrders = () =>
  customerClient.get(
    `/api/public/${TENANT}/customers/me/orders/`
  ).then(r => r.data)

export interface Review {
  id: number
  author_name: string
  rating: number
  text: string
  created_at: string
}

export const getReviews = () =>
  client.get<Review[]>(`/api/public/${TENANT}/reviews/`).then(r => r.data)

export const submitReview = (data: { rating: number; text: string }) =>
  customerClient.post<Review>(
    `/api/public/${TENANT}/customers/me/reviews/`,
    data
  ).then(r => r.data)

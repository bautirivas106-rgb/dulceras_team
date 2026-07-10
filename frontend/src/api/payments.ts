import client from './client'

const TENANT = 'dulceras-team'

export interface PaymentInitResponse {
  payment_intent_id: number
  init_point: string | null
  sandbox_init_point: string | null
  amount: string
  sandbox?: boolean
  detail?: string
}

export interface PaymentStatusResponse {
  id: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded'
  amount: string
  mp_payment_id: string
}

export async function initiatePayment(orderId: number): Promise<PaymentInitResponse> {
  const { data } = await client.post<PaymentInitResponse>(
    `/api/public/${TENANT}/payments/orders/${orderId}/initiate/`
  )
  return data
}

export async function getPaymentStatus(orderId: number): Promise<PaymentStatusResponse> {
  const { data } = await client.get<PaymentStatusResponse>(
    `/api/public/${TENANT}/payments/orders/${orderId}/status/`
  )
  return data
}

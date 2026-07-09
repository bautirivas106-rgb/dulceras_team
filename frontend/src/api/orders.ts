import client from './client'
import type { DeliveryZone, OrderCreatePayload, OrderDetail } from '../types/orders'

export async function getDeliveryZones(tenantSlug: string): Promise<DeliveryZone[]> {
  const { data } = await client.get<DeliveryZone[]>(
    `/api/public/${tenantSlug}/delivery-zones/`
  )
  return data
}

export async function createOrder(
  tenantSlug: string,
  payload: OrderCreatePayload
): Promise<OrderDetail> {
  const { data } = await client.post<OrderDetail>(
    `/api/public/${tenantSlug}/orders/`,
    payload
  )
  return data
}

export async function getOrder(tenantSlug: string, id: number): Promise<OrderDetail> {
  const { data } = await client.get<OrderDetail>(
    `/api/public/${tenantSlug}/orders/${id}/`
  )
  return data
}

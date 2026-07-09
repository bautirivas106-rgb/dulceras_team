export interface DeliveryZone {
  id: number
  name: string
  description: string
  price: string
}

export interface OrderCreatePayload {
  customer_name: string
  customer_phone: string
  customer_email?: string
  items: { variant_id: number; quantity: number }[]
  delivery_method: 'pickup' | 'delivery'
  delivery_zone_id?: number | null
  required_date: string
  address_street?: string
  address_neighborhood?: string
  notes?: string
}

export interface OrderItem {
  id: number
  product_name: string
  variant_name: string
  unit_price: string
  quantity: number
  subtotal: string
}

export interface OrderDetail {
  id: number
  status: string
  status_display: string
  customer: { name: string; phone: string; email: string }
  delivery_method: string
  delivery_method_display: string
  delivery_zone: number | null
  delivery_zone_name: string | null
  required_date: string
  subtotal: string
  delivery_cost: string
  total: string
  deposit_percentage: string
  deposit_amount: string
  balance_amount: string
  notes: string
  items: OrderItem[]
  created_at: string
}

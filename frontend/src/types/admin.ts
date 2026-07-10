export interface AdminOrderListItem {
  id: number
  status: string
  status_display: string
  customer: { name: string; phone: string; email: string }
  delivery_method: string
  delivery_method_display: string
  required_date: string
  total: string
  deposit_amount: string
  balance_amount: string
  created_at: string
}

export interface AdminOrderItem {
  id: number
  product_name: string
  variant_name: string
  unit_price: string
  quantity: number
  subtotal: string
}

export interface StatusHistoryEntry {
  from_status: string
  to_status: string
  changed_by: string | null
  changed_at: string
  notes: string
}

export interface AdminOrderDetail extends AdminOrderListItem {
  delivery_zone: number | null
  delivery_zone_name: string | null
  subtotal: string
  delivery_cost: string
  deposit_percentage: string
  notes: string
  items: AdminOrderItem[]
  status_history: StatusHistoryEntry[]
  updated_at: string
}

export interface OrderStats {
  pending_deposit: number
  deposit_paid: number
  active: number
  today_orders: number
  monthly_revenue: number
}

export interface AdminNotification {
  id: number
  type: string
  type_display: string
  title: string
  message: string
  is_read: boolean
  order_id: number | null
  created_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface OrderFilters {
  status?: string
  date?: string
  customer?: string
  page?: number
}

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  pending_deposit: 'Esperando seña',
  deposit_paid: 'Seña recibida',
  confirmed: 'Confirmado',
  in_production: 'En producción',
  ready: 'Listo',
  out_for_delivery: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
}

export const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  pending_deposit: 'bg-amber-100 text-amber-700',
  deposit_paid: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  in_production: 'bg-purple-100 text-purple-700',
  ready: 'bg-teal-100 text-teal-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
  refunded: 'bg-pink-100 text-pink-700',
}

export interface CalendarOrderItem {
  id: number
  customer: string
  status: string
  status_display: string
  total: string
}

export interface CalendarDay {
  count: number
  orders: CalendarOrderItem[]
}

export interface CalendarData {
  month: string
  max_per_day: number
  days: Record<string, CalendarDay>
}

export interface ProductionVariant {
  name: string
  quantity: number
}

export interface ProductionSummaryItem {
  product: string
  total_units: number
  variants: ProductionVariant[]
}

export interface ProductionDay {
  date: string
  orders: AdminOrderDetail[]
  production_summary: ProductionSummaryItem[]
}

export interface ReportRevenue {
  total: number
  deposits_collected: number
  balance_pending: number
  order_count: number
}

export interface ReportByStatus {
  status: string
  label: string
  count: number
}

export interface ReportTopProduct {
  product_name: string
  variant_name: string
  qty: number
  revenue: number
}

export interface ReportByZone {
  zone: string
  count: number
  revenue: number
}

export interface ReportDaily {
  date: string
  count: number
  revenue: number
}

export interface ReportData {
  period: string
  from_date: string | null
  to_date: string | null
  revenue: ReportRevenue
  by_status: ReportByStatus[]
  top_products: ReportTopProduct[]
  by_zone: ReportByZone[]
  daily: ReportDaily[]
}

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['pending_deposit', 'cancelled'],
  pending_deposit: ['deposit_paid', 'confirmed', 'cancelled'],
  deposit_paid: ['confirmed', 'cancelled'],
  confirmed: ['in_production', 'cancelled'],
  in_production: ['ready', 'cancelled'],
  ready: ['out_for_delivery', 'delivered'],
  out_for_delivery: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
}

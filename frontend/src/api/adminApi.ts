import adminClient from './adminClient'
import type {
  AdminOrderDetail,
  AdminOrderListItem,
  AdminNotification,
  OrderFilters,
  OrderStats,
  PaginatedResponse,
} from '../types/admin'

// ── Orders ─────────────────────────────────────────────────────────────────

export const getOrderStats = () =>
  adminClient.get<OrderStats>('/api/admin/orders/stats/')

export const getOrders = (filters: OrderFilters = {}) =>
  adminClient.get<PaginatedResponse<AdminOrderListItem>>('/api/admin/orders/', {
    params: {
      status: filters.status || undefined,
      date: filters.date || undefined,
      customer: filters.customer || undefined,
      page: filters.page || undefined,
    },
  })

export const getOrder = (id: number) =>
  adminClient.get<AdminOrderDetail>(`/api/admin/orders/${id}/`)

export const updateOrderStatus = (id: number, status: string, notes = '') =>
  adminClient.patch<AdminOrderDetail>(`/api/admin/orders/${id}/status/`, { status, notes })

// ── Notifications ──────────────────────────────────────────────────────────

export const getUnreadCount = () =>
  adminClient.get<{ unread_count: number }>('/api/admin/notifications/unread-count/')

export const getNotifications = (is_read?: boolean) =>
  adminClient.get<PaginatedResponse<AdminNotification>>('/api/admin/notifications/', {
    params: is_read !== undefined ? { is_read } : {},
  })

export const markNotificationRead = (id: number) =>
  adminClient.post<AdminNotification>(`/api/admin/notifications/${id}/mark-read/`)

export const markAllRead = () =>
  adminClient.post<{ marked_read: number }>('/api/admin/notifications/mark-all-read/')

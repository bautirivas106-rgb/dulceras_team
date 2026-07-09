import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUnreadCount, getNotifications, markAllRead, markNotificationRead } from '../../../api/adminApi'
import type { AdminNotification } from '../../../types/admin'

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'Ahora'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
  return `Hace ${Math.floor(diff / 86400)} d`
}

export default function NotificationBell() {
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Poll unread count every 60s
  useEffect(() => {
    const fetchCount = () =>
      getUnreadCount()
        .then(({ data }) => setUnread(data.unread_count))
        .catch(() => {})
    fetchCount()
    const id = setInterval(fetchCount, 60_000)
    return () => clearInterval(id)
  }, [])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleOpen() {
    if (!open) {
      try {
        const { data } = await getNotifications()
        setNotifications(data.results.slice(0, 15))
      } catch {}
    }
    setOpen((v) => !v)
  }

  async function handleMarkAll() {
    await markAllRead().catch(() => {})
    setUnread(0)
    setNotifications((ns) => ns.map((n) => ({ ...n, is_read: true })))
  }

  async function handleClickNotification(n: AdminNotification) {
    if (!n.is_read) {
      await markNotificationRead(n.id).catch(() => {})
      setNotifications((ns) =>
        ns.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)),
      )
      setUnread((c) => Math.max(0, c - 1))
    }
    if (n.order_id) {
      navigate(`/admin/orders/${n.order_id}`)
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Notificaciones"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-[#E8889A] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-800">Notificaciones</span>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-[#E8889A] hover:underline"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Sin notificaciones</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClickNotification(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    !n.is_read ? 'border-l-2 border-[#E8889A]' : ''
                  }`}
                >
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

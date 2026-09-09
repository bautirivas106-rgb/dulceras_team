import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOrderStats, getOrders } from '../../../api/adminApi'
import type { AdminOrderListItem, OrderStats } from '../../../types/admin'
import { STATUS_COLORS, STATUS_LABELS } from '../../../types/admin'

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

function StatCard({
  label,
  value,
  accent,
  sub,
  icon,
}: {
  label: string
  value: string | number
  accent: string
  sub?: string
  icon: string
}) {
  return (
    <div
      className="bg-white rounded-2xl p-5"
      style={{ boxShadow: '0 4px 16px rgba(58,36,23,0.07)', border: '1px solid rgba(58,36,23,0.07)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-brown-soft uppercase tracking-wider">{label}</p>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <p className={`text-3xl font-bold font-fraunces ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-brown-soft mt-1.5 opacity-70">{sub}</p>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [recent, setRecent] = useState<AdminOrderListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getOrderStats().then(({ data }) => setStats(data)),
      getOrders({ page: 1 }).then(({ data }) => setRecent(data.results.slice(0, 8))),
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E285AF', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-fraunces font-bold text-brown" style={{ fontSize: '1.6rem' }}>Dashboard</h1>
        <p className="text-sm text-brown-soft mt-0.5">Resumen del negocio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Esperando seña"
          value={stats?.pending_deposit ?? 0}
          accent="text-amber-600"
          sub="Pendientes de pago"
          icon="⏳"
        />
        <StatCard
          label="Seña recibida"
          value={stats?.deposit_paid ?? 0}
          accent="text-blue-600"
          sub="Listas para confirmar"
          icon="✅"
        />
        <StatCard
          label="En proceso"
          value={stats?.active ?? 0}
          accent="text-green-600"
          sub="Confirmados / producción"
          icon="🎂"
        />
        <StatCard
          label="Ingresos del mes"
          value={fmt(stats?.monthly_revenue ?? 0)}
          accent="text-brown"
          sub={`${stats?.today_orders ?? 0} pedidos para hoy`}
          icon="💰"
        />
      </div>

      {/* Recent orders */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 4px 16px rgba(58,36,23,0.07)', border: '1px solid rgba(58,36,23,0.07)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(58,36,23,0.07)' }}
        >
          <h2 className="text-sm font-semibold text-brown">Pedidos recientes</h2>
          <Link
            to="/admin/orders"
            className="text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: '#E285AF' }}
          >
            Ver todos →
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="text-sm text-brown-soft text-center py-10 opacity-60">Sin pedidos aún</p>
        ) : (
          <div>
            {recent.map((order, i) => (
              <Link
                key={order.id}
                to={`/admin/orders/${order.id}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#FDF6EC]"
                style={i < recent.length - 1 ? { borderBottom: '1px solid rgba(58,36,23,0.05)' } : undefined}
              >
                <span className="text-xs font-mono text-brown-soft w-12 opacity-60">#{order.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brown truncate">{order.customer.name}</p>
                  <p className="text-xs text-brown-soft opacity-60">{order.customer.phone}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-brown-soft">{order.required_date}</p>
                  <p className="text-xs text-brown-soft opacity-60">{order.delivery_method_display}</p>
                </div>
                <StatusBadge status={order.status} />
                <span className="text-sm font-semibold text-brown w-24 text-right">
                  ${parseFloat(order.total).toLocaleString('es-AR')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

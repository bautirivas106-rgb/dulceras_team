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
}: {
  label: string
  value: string | number
  accent: string
  sub?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
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
        <div className="w-8 h-8 border-2 border-[#E8889A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Resumen del negocio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Esperando seña"
          value={stats?.pending_deposit ?? 0}
          accent="text-amber-600"
          sub="Pendientes de pago"
        />
        <StatCard
          label="Seña recibida"
          value={stats?.deposit_paid ?? 0}
          accent="text-blue-600"
          sub="Listas para confirmar"
        />
        <StatCard
          label="En proceso"
          value={stats?.active ?? 0}
          accent="text-green-600"
          sub="Confirmados / producción"
        />
        <StatCard
          label="Ingresos del mes"
          value={fmt(stats?.monthly_revenue ?? 0)}
          accent="text-[#3D1A0E]"
          sub={`${stats?.today_orders ?? 0} pedidos para hoy`}
        />
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Pedidos recientes</h2>
          <Link to="/admin/orders" className="text-xs text-[#E8889A] hover:underline">
            Ver todos →
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">Sin pedidos aún</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map((order) => (
              <Link
                key={order.id}
                to={`/admin/orders/${order.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-mono text-gray-400 w-12">#{order.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{order.customer.name}</p>
                  <p className="text-xs text-gray-400">{order.customer.phone}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-500">{order.required_date}</p>
                  <p className="text-xs text-gray-400">{order.delivery_method_display}</p>
                </div>
                <StatusBadge status={order.status} />
                <span className="text-sm font-semibold text-gray-700 w-24 text-right">
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

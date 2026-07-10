import { useState, useEffect } from 'react'
import { getReports } from '../../../api/adminApi'
import type { ReportData } from '../../../types/admin'
import { STATUS_LABELS, STATUS_COLORS } from '../../../types/admin'

type Period = 'today' | 'week' | 'month' | 'all'

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hoy',
  week: 'Esta semana',
  month: 'Este mes',
  all: 'Todo',
}

function fmt(n: number) {
  return n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtMoney(n: number) {
  return `$${fmt(n)}`
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getReports(period)
      .then(r => setData(r.data))
      .catch(() => setError('No se pudieron cargar los reportes.'))
      .finally(() => setLoading(false))
  }, [period])

  const maxDailyRevenue = data?.daily.length
    ? Math.max(...data.daily.map(d => d.revenue), 1)
    : 1

  const maxStatusCount = data?.by_status.length
    ? Math.max(...data.by_status.map(s => s.count), 1)
    : 1

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          {data && (data.from_date || data.to_date) && (
            <p className="text-sm text-gray-500 mt-0.5">
              {data.from_date === data.to_date
                ? data.from_date
                : `${data.from_date ?? '—'} → ${data.to_date ?? '—'}`}
            </p>
          )}
        </div>

        {/* Period selector */}
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                period === p
                  ? 'bg-white shadow text-[#3D1A0E]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-[#E8889A] border-t-transparent rounded-full" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <div className="space-y-6">

          {/* Revenue cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <RevenueCard
              label="Facturación total"
              value={fmtMoney(data.revenue.total)}
              sub={`${data.revenue.order_count} pedidos`}
              accent="bg-[#E8889A]"
            />
            <RevenueCard
              label="Señas cobradas"
              value={fmtMoney(data.revenue.deposits_collected)}
              sub="ingresó en caja"
              accent="bg-green-500"
            />
            <RevenueCard
              label="Saldo pendiente"
              value={fmtMoney(data.revenue.balance_pending)}
              sub="por cobrar al entregar"
              accent="bg-amber-500"
            />
            <RevenueCard
              label="Ticket promedio"
              value={
                data.revenue.order_count > 0
                  ? fmtMoney(Math.round(data.revenue.total / data.revenue.order_count))
                  : '$—'
              }
              sub="por pedido"
              accent="bg-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Por estado */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Por estado</h2>
              {data.by_status.length === 0 ? (
                <p className="text-gray-400 text-sm">Sin datos</p>
              ) : (
                <div className="space-y-2.5">
                  {data.by_status.map(row => (
                    <div key={row.status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[row.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_LABELS[row.status] ?? row.label}
                        </span>
                        <span className="font-semibold text-gray-700">{row.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#E8889A] rounded-full transition-all duration-500"
                          style={{ width: `${(row.count / maxStatusCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Por zona */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Por zona de entrega</h2>
              {data.by_zone.length === 0 ? (
                <p className="text-gray-400 text-sm">Sin datos</p>
              ) : (
                <div className="space-y-3">
                  {data.by_zone.map(row => (
                    <div key={row.zone} className="flex items-center justify-between text-sm">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="font-medium text-gray-700 truncate">{row.zone}</p>
                        <p className="text-gray-400 text-xs">{row.count} pedido{row.count !== 1 ? 's' : ''}</p>
                      </div>
                      <span className="font-semibold text-gray-800 whitespace-nowrap">
                        {fmtMoney(row.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ventas diarias (bar chart simple) */}
          {data.daily.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Ventas diarias</h2>
              <div className="flex items-end gap-1 h-40 overflow-x-auto pb-2">
                {data.daily.map(day => {
                  const height = Math.max(4, (day.revenue / maxDailyRevenue) * 100)
                  const label = day.date.slice(5) // MM-DD
                  return (
                    <div key={day.date} className="flex flex-col items-center gap-1 flex-shrink-0 group" style={{ minWidth: 28 }}>
                      <div className="relative w-full">
                        <div
                          className="w-full bg-[#E8889A] rounded-t transition-all duration-300 cursor-default"
                          style={{ height: `${height}%`, minHeight: 4 }}
                          title={`${day.date}: ${fmtMoney(day.revenue)} (${day.count} pedidos)`}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 rotate-0">{label}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{fmtMoney(0)}</span>
                <span>{fmtMoney(maxDailyRevenue)}</span>
              </div>
            </div>
          )}

          {/* Top productos */}
          {data.top_products.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Productos más vendidos</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-gray-500 font-medium pb-2 pr-4">#</th>
                      <th className="text-left text-gray-500 font-medium pb-2 pr-4">Producto</th>
                      <th className="text-left text-gray-500 font-medium pb-2 pr-4">Variante</th>
                      <th className="text-right text-gray-500 font-medium pb-2 pr-4">Unidades</th>
                      <th className="text-right text-gray-500 font-medium pb-2">Facturado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_products.map((p, i) => (
                      <tr key={`${p.product_name}-${p.variant_name}`} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5 pr-4 text-gray-400">{i + 1}</td>
                        <td className="py-2.5 pr-4 font-medium text-gray-800">{p.product_name}</td>
                        <td className="py-2.5 pr-4 text-gray-500">{p.variant_name || '—'}</td>
                        <td className="py-2.5 pr-4 text-right font-semibold text-gray-700">{p.qty}</td>
                        <td className="py-2.5 text-right font-semibold text-[#3D1A0E]">{fmtMoney(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.revenue.order_count === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📊</p>
              <p className="font-medium">Sin datos para este período</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RevenueCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub: string
  accent: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className={`w-2 h-2 rounded-full ${accent} mb-3`} />
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-600 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getOrders } from '../../../api/adminApi'
import type { AdminOrderListItem, PaginatedResponse } from '../../../types/admin'
import { STATUS_COLORS, STATUS_LABELS } from '../../../types/admin'

const ALL_STATUSES = Object.entries(STATUS_LABELS)

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState<PaginatedResponse<AdminOrderListItem> | null>(null)
  const [loading, setLoading] = useState(true)

  const status = searchParams.get('status') ?? ''
  const date = searchParams.get('date') ?? ''
  const customer = searchParams.get('customer') ?? ''
  const page = parseInt(searchParams.get('page') ?? '1')

  useEffect(() => {
    setLoading(true)
    getOrders({ status: status || undefined, date: date || undefined, customer: customer || undefined, page })
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status, date, customer, page])

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const totalPages = data ? Math.ceil(data.count / 20) : 1

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pedidos</h1>
        {data && <p className="text-sm text-gray-500 mt-0.5">{data.count} pedido{data.count !== 1 ? 's' : ''}</p>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => setParam('status', e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E8889A] bg-white"
        >
          <option value="">Todos los estados</option>
          {ALL_STATUSES.map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setParam('date', e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E8889A] bg-white"
        />

        <input
          type="text"
          placeholder="Buscar por teléfono..."
          value={customer}
          onChange={(e) => setParam('customer', e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E8889A] bg-white flex-1 min-w-40"
        />

        {(status || date || customer) && (
          <button
            onClick={() => setSearchParams({})}
            className="text-sm text-gray-500 hover:text-gray-800 px-3 py-2"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-[#E8889A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data || data.results.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-16">Sin pedidos</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">#</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Entrega</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Seña</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.results.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-gray-400">#{order.id}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-800">{order.customer.name}</p>
                        <p className="text-xs text-gray-400">{order.customer.phone}</p>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">{order.required_date}</td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs">{order.delivery_method_display}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-gray-700">
                        ${parseFloat(order.total).toLocaleString('es-AR')}
                      </td>
                      <td className="px-5 py-3.5 text-right text-gray-500">
                        ${parseFloat(order.deposit_amount).toLocaleString('es-AR')}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="text-xs text-[#E8889A] hover:underline font-medium"
                        >
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Página {page} de {totalPages} · {data.count} resultados
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setParam('page', String(page - 1))}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    ← Anterior
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setParam('page', String(page + 1))}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

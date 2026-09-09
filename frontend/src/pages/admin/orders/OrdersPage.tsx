import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { getOrders } from '../../../api/adminApi'
import type { AdminOrderListItem, PaginatedResponse } from '../../../types/admin'
import { STATUS_LABELS } from '../../../types/admin'

const ALL_STATUSES = Object.entries(STATUS_LABELS)

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  draft:            { bg: 'rgba(58,36,23,0.07)',   color: '#7A5C4A' },
  pending_deposit:  { bg: 'rgba(251,191,36,0.15)',  color: '#92660A' },
  deposit_paid:     { bg: 'rgba(96,165,250,0.15)',  color: '#1D56A0' },
  confirmed:        { bg: 'rgba(52,211,153,0.15)',  color: '#0D7A54' },
  in_production:    { bg: 'rgba(167,139,250,0.15)', color: '#6030B0' },
  ready:            { bg: 'rgba(45,212,191,0.15)',  color: '#0E7C72' },
  out_for_delivery: { bg: 'rgba(240,160,196,0.2)',  color: '#A04070' },
  delivered:        { bg: 'rgba(226,133,175,0.12)', color: '#8A2050' },
  cancelled:        { bg: 'rgba(248,113,113,0.12)', color: '#9B2335' },
  refunded:         { bg: 'rgba(58,36,23,0.07)',    color: '#7A5C4A' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { bg: 'rgba(58,36,23,0.07)', color: '#7A5C4A' }
  return (
    <span
      className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

const inputStyle: React.CSSProperties = {
  border: '1.5px solid rgba(58,36,23,0.12)',
  borderRadius: 12,
  padding: '8px 14px',
  fontSize: '0.85rem',
  color: '#3A2417',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.2s',
}

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState<PaginatedResponse<AdminOrderListItem> | null>(null)
  const [loading, setLoading] = useState(true)

  const status   = searchParams.get('status')   ?? ''
  const date     = searchParams.get('date')     ?? ''
  const customer = searchParams.get('customer') ?? ''
  const page     = parseInt(searchParams.get('page') ?? '1')

  useEffect(() => {
    setLoading(true)
    getOrders({ status: status || undefined, date: date || undefined, customer: customer || undefined, page })
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status, date, customer, page])

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const totalPages = data ? Math.ceil(data.count / 20) : 1

  return (
    <div className="p-6 space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div>
        <h1
          className="font-fraunces font-bold text-brown"
          style={{ fontSize: '1.6rem', marginBottom: 2 }}
        >
          Pedidos
        </h1>
        {data && (
          <p className="text-brown-soft text-sm">
            {data.count} pedido{data.count !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={status}
          onChange={e => setParam('status', e.target.value)}
          style={inputStyle}
          onFocus={e => (e.currentTarget.style.borderColor = '#E285AF')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(58,36,23,0.12)')}
        >
          <option value="">Todos los estados</option>
          {ALL_STATUSES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <input
          type="date"
          value={date}
          onChange={e => setParam('date', e.target.value)}
          style={inputStyle}
          onFocus={e => (e.currentTarget.style.borderColor = '#E285AF')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(58,36,23,0.12)')}
        />

        <div className="relative flex-1 min-w-44">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brown-soft opacity-60 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por teléfono..."
            value={customer}
            onChange={e => setParam('customer', e.target.value)}
            style={{ ...inputStyle, paddingLeft: 34, width: '100%' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#E285AF')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(58,36,23,0.12)')}
          />
        </div>

        {(status || date || customer) && (
          <button
            onClick={() => setSearchParams({})}
            className="text-sm text-brown-soft px-3 py-2 rounded-xl hover:bg-[rgba(58,36,23,0.05)] transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Table card */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(58,36,23,0.07)', boxShadow: '0 4px 16px rgba(58,36,23,0.06)' }}
      >
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E285AF', borderTopColor: 'transparent' }} />
          </div>
        ) : !data || data.results.length === 0 ? (
          <p className="text-sm text-brown-soft text-center py-16 opacity-60">Sin pedidos</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(58,36,23,0.07)', background: '#FDF6EC' }}>
                    {['#', 'Cliente', 'Fecha', 'Entrega', 'Estado', 'Total', 'Seña', ''].map((h, i) => (
                      <th
                        key={i}
                        className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-brown-soft ${i >= 5 && i < 7 ? 'text-right' : 'text-left'}`}
                        style={{ letterSpacing: '0.04em' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((order, idx) => (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: idx < data.results.length - 1 ? '1px solid rgba(58,36,23,0.05)' : 'none',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FDF6EC')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}
                    >
                      <td className="px-5 py-3.5 font-mono text-sm text-brown-soft">#{order.id}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-brown">{order.customer.name}</p>
                        <p className="text-xs text-brown-soft opacity-70">{order.customer.phone}</p>
                      </td>
                      <td className="px-4 py-3.5 text-brown-soft">{order.required_date}</td>
                      <td className="px-4 py-3.5 text-xs text-brown-soft">{order.delivery_method_display}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-brown">
                        ${parseFloat(order.total).toLocaleString('es-AR')}
                      </td>
                      <td className="px-5 py-3.5 text-right text-brown-soft">
                        ${parseFloat(order.deposit_amount).toLocaleString('es-AR')}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="text-xs font-semibold no-underline"
                          style={{ color: '#E285AF' }}
                          onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                          onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
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
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ borderTop: '1px solid rgba(58,36,23,0.07)' }}
              >
                <p className="text-xs text-brown-soft">
                  Página {page} de {totalPages} · {data.count} resultados
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setParam('page', String(page - 1))}
                    className="px-3 py-1.5 text-xs rounded-xl disabled:opacity-40 transition-colors"
                    style={{ border: '1.5px solid rgba(58,36,23,0.12)', color: '#5A3B29', background: 'transparent' }}
                    onMouseEnter={e => { if (page > 1) e.currentTarget.style.background = '#FDF6EC' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    ← Anterior
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setParam('page', String(page + 1))}
                    className="px-3 py-1.5 text-xs rounded-xl disabled:opacity-40 transition-colors"
                    style={{ border: '1.5px solid rgba(58,36,23,0.12)', color: '#5A3B29', background: 'transparent' }}
                    onMouseEnter={e => { if (page < totalPages) e.currentTarget.style.background = '#FDF6EC' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
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

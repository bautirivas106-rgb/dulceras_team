import { type FormEvent, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrder, updateOrderStatus } from '../../../api/adminApi'
import type { AdminOrderDetail } from '../../../types/admin'
import { STATUS_COLORS, STATUS_LABELS, STATUS_TRANSITIONS } from '../../../types/admin'

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-1.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right max-w-xs">{value}</span>
    </div>
  )
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<AdminOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Status update form
  const [newStatus, setNewStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')

  useEffect(() => {
    if (!id) return
    getOrder(Number(id))
      .then(({ data }) => {
        setOrder(data)
        const allowed = STATUS_TRANSITIONS[data.status] ?? []
        if (allowed.length) setNewStatus(allowed[0])
      })
      .catch(() => setError('No se pudo cargar el pedido.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleStatusUpdate(e: FormEvent) {
    e.preventDefault()
    if (!order || !newStatus) return
    setUpdating(true)
    setUpdateError('')
    try {
      const { data } = await updateOrderStatus(order.id, newStatus, notes)
      setOrder(data)
      setNotes('')
      const allowed = STATUS_TRANSITIONS[data.status] ?? []
      setNewStatus(allowed.length ? allowed[0] : '')
    } catch {
      setUpdateError('No se pudo actualizar el estado.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#E8889A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <p className="text-red-600 text-sm">{error || 'Pedido no encontrado.'}</p>
        <Link to="/admin/orders" className="text-sm text-[#E8889A] mt-2 inline-block hover:underline">
          ← Volver a pedidos
        </Link>
      </div>
    )
  }

  const allowedTransitions = STATUS_TRANSITIONS[order.status] ?? []

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/orders" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Pedido #{order.id}</h1>
        <StatusBadge status={order.status} />
        <span className="text-sm text-gray-400 ml-auto">{timeLabel(order.created_at)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <Section title="Productos">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs font-medium text-gray-500">Producto</th>
                  <th className="text-center py-2 text-xs font-medium text-gray-500 w-16">Cant.</th>
                  <th className="text-right py-2 text-xs font-medium text-gray-500 w-24">Precio</th>
                  <th className="text-right py-2 text-xs font-medium text-gray-500 w-24">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5">
                      <p className="font-medium text-gray-800">{item.product_name}</p>
                      <p className="text-xs text-gray-400">{item.variant_name}</p>
                    </td>
                    <td className="py-2.5 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-2.5 text-right text-gray-600">
                      ${parseFloat(item.unit_price).toLocaleString('es-AR')}
                    </td>
                    <td className="py-2.5 text-right font-medium text-gray-800">
                      ${parseFloat(item.subtotal).toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Financial */}
          <Section title="Resumen de pago">
            <div className="space-y-1 divide-y divide-gray-50">
              <Row label="Subtotal" value={`$${parseFloat(order.subtotal).toLocaleString('es-AR')}`} />
              <Row label="Envío" value={`$${parseFloat(order.delivery_cost).toLocaleString('es-AR')}`} />
              <Row
                label={<span className="font-semibold">Total</span>}
                value={<span className="font-bold text-lg">${parseFloat(order.total).toLocaleString('es-AR')}</span>}
              />
              <Row
                label={`Seña (${order.deposit_percentage}%)`}
                value={`$${parseFloat(order.deposit_amount).toLocaleString('es-AR')}`}
              />
              <Row
                label="Saldo restante"
                value={`$${parseFloat(order.balance_amount).toLocaleString('es-AR')}`}
              />
            </div>
          </Section>

          {/* Status history */}
          <Section title="Historial de estados">
            {order.status_history.length === 0 ? (
              <p className="text-sm text-gray-400">Sin historial</p>
            ) : (
              <div className="space-y-3">
                {order.status_history.map((h, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="mt-1 w-2 h-2 rounded-full bg-[#E8889A] flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-800">
                        {h.from_status ? (
                          <>
                            <span className="font-medium">{STATUS_LABELS[h.from_status] ?? h.from_status}</span>
                            {' → '}
                            <span className="font-medium">{STATUS_LABELS[h.to_status] ?? h.to_status}</span>
                          </>
                        ) : (
                          <span className="font-medium">Pedido creado — {STATUS_LABELS[h.to_status] ?? h.to_status}</span>
                        )}
                      </p>
                      {h.notes && <p className="text-xs text-gray-500 mt-0.5">{h.notes}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {timeLabel(h.changed_at)}{h.changed_by ? ` · ${h.changed_by}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Customer */}
          <Section title="Cliente">
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Nombre</p>
                <p className="text-sm font-medium text-gray-800">{order.customer.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Teléfono</p>
                <a href={`tel:${order.customer.phone}`} className="text-sm text-[#E8889A] hover:underline">
                  {order.customer.phone}
                </a>
              </div>
              {order.customer.email && (
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-700">{order.customer.email}</p>
                </div>
              )}
            </div>
          </Section>

          {/* Delivery */}
          <Section title="Entrega">
            <div className="space-y-2">
              <Row label="Método" value={order.delivery_method_display} />
              <Row label="Fecha" value={order.required_date} />
              {order.delivery_zone_name && (
                <Row label="Zona" value={order.delivery_zone_name} />
              )}
              {order.notes && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Notas del cliente</p>
                  <p className="text-sm text-gray-700">{order.notes}</p>
                </div>
              )}
            </div>
          </Section>

          {/* Status update */}
          {allowedTransitions.length > 0 && (
            <Section title="Cambiar estado">
              <form onSubmit={handleStatusUpdate} className="space-y-3">
                {updateError && (
                  <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{updateError}</p>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nuevo estado</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E8889A]"
                  >
                    {allowedTransitions.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Notas <span className="text-gray-400">(opcional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E8889A] resize-none"
                    placeholder="Motivo del cambio..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={updating || !newStatus}
                  className="w-full bg-[#3D1A0E] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#5C2A18] transition-colors disabled:opacity-60"
                >
                  {updating ? 'Guardando...' : 'Actualizar estado'}
                </button>
              </form>
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}

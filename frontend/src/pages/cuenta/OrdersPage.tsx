import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCustomerOrders, updateCustomerProfile } from '../../api/customerApi'
import { useCustomerAuth } from '../../context/CustomerAuthContext'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  pending_deposit: 'Esperando seña',
  deposit_paid: 'Seña pagada',
  confirmed: 'Confirmado',
  in_production: 'En producción',
  ready: 'Listo',
  out_for_delivery: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  refunded: 'Reintegrado',
}

const STATUS_COLOR: Record<string, string> = {
  pending_deposit: 'bg-yellow-100 text-yellow-700',
  deposit_paid: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-blue-100 text-blue-700',
  in_production: 'bg-purple-100 text-purple-700',
  ready: 'bg-green-100 text-green-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
  refunded: 'bg-orange-100 text-orange-700',
}

interface Order {
  id: number
  status: string
  status_display: string
  required_date: string
  total: string
  deposit_amount: string
  balance_amount: string
  discount_amount: string
  created_at: string
}

function EditProfileModal({
  initial,
  onSave,
  onClose,
}: {
  initial: { name: string; phone: string }
  onSave: (data: { name: string; phone: string }) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try { await onSave(form); onClose() }
    finally { setSaving(false) }
  }

  const inputCls = 'w-full border border-[#E8C8A0] rounded-xl px-4 py-3 text-sm text-[#3D1A0E] focus:outline-none focus:ring-2 focus:ring-[#E8889A]/30 focus:border-[#E8889A]'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <h2 className="font-bold text-[#3D1A0E] mb-4">Editar datos</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#7C4A2D] mb-1">Nombre</label>
            <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7C4A2D] mb-1">Teléfono</label>
            <input className={inputCls} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-[#E8C8A0] text-[#7C4A2D] py-2.5 rounded-full text-sm font-semibold hover:bg-[#FDF6EC]">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 bg-[#E8889A] text-white py-2.5 rounded-full text-sm font-semibold hover:bg-[#d9768a] disabled:opacity-60">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CustomerOrdersPage() {
  const { customer, isLoggedIn, logout, setCustomer } = useCustomerAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) { navigate('/cuenta/login', { state: { from: '/cuenta/pedidos' } }); return }
    getCustomerOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isLoggedIn, navigate])

  async function handleProfileUpdate(data: { name: string; phone: string }) {
    const updated = await updateCustomerProfile(data)
    setCustomer(updated)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  if (!isLoggedIn) return null

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <header className="bg-[#FDF6EC] border-b border-[#F5E8D0] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-bold text-[#3D1A0E]">🍫 Dulceras Team</Link>
          <button onClick={handleLogout} className="text-sm text-[#A0673A] hover:text-[#7C4A2D]">
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Perfil */}
        <div className="bg-white rounded-2xl border border-[#F5E8D0] p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="font-bold text-[#3D1A0E] text-lg">{customer?.name}</p>
            <p className="text-sm text-[#7C4A2D]">{customer?.email}</p>
            <p className="text-sm text-[#A0673A]">{customer?.phone}</p>
          </div>
          <button
            onClick={() => setEditModal(true)}
            className="text-sm font-semibold text-[#E8889A] hover:underline"
          >
            Editar datos
          </button>
        </div>

        {/* Pedidos */}
        <h2 className="text-xl font-bold text-[#3D1A0E] mb-4">Mis pedidos</h2>

        {loading ? (
          <p className="text-[#7C4A2D] text-sm">Cargando pedidos...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#F5E8D0]">
            <div className="text-4xl mb-3">📦</div>
            <p className="font-semibold text-[#3D1A0E] mb-1">Todavía no tenés pedidos</p>
            <p className="text-sm text-[#7C4A2D] mb-5">¿Qué te antoja hoy?</p>
            <Link
              to="/"
              className="bg-[#E8889A] text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-[#d9768a] transition-colors"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <Link
                key={order.id}
                to={`/pedido/${order.id}`}
                className="block bg-white rounded-2xl border border-[#F5E8D0] p-5 hover:border-[#E8889A]/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs text-[#A0673A] font-mono">Pedido #{order.id}</span>
                    <p className="text-sm text-[#7C4A2D] mt-0.5">
                      📅 {new Date(order.required_date + 'T00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {STATUS_LABELS[order.status] ?? order.status_display}
                  </span>
                </div>

                <div className="flex justify-between items-end text-sm">
                  <div className="space-y-0.5">
                    <p className="text-[#7C4A2D]">Total: <strong className="text-[#3D1A0E]">${Number(order.total).toLocaleString('es-AR')}</strong></p>
                    {Number(order.discount_amount) > 0 && (
                      <p className="text-green-600 text-xs">Descuento aplicado: −${Number(order.discount_amount).toLocaleString('es-AR')}</p>
                    )}
                  </div>
                  <p className="text-[#A0673A] text-xs">
                    {new Date(order.created_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {editModal && customer && (
        <EditProfileModal
          initial={{ name: customer.name, phone: customer.phone }}
          onSave={handleProfileUpdate}
          onClose={() => setEditModal(false)}
        />
      )}
    </div>
  )
}

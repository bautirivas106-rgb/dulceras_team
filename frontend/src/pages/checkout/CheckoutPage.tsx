import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { getDeliveryZones, createOrder, getDateAvailability } from '../../api/orders'
import type { DeliveryZone } from '../../types/orders'

const TENANT = 'dulceras-team'

function minDate(advanceHours: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + Math.ceil(advanceHours / 24))
  return d.toISOString().split('T')[0]
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, total, maxAdvanceHours, clear } = useCart()

  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [unavailableDates, setUnavailableDates] = useState<string[]>([])
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_method: 'pickup' as 'pickup' | 'delivery',
    delivery_zone_id: '',
    required_date: '',
    address_street: '',
    address_neighborhood: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getDeliveryZones(TENANT).then(setZones).catch(() => {})
    getDateAvailability(TENANT)
      .then(({ unavailable }) => setUnavailableDates(unavailable))
      .catch(() => {})
  }, [])

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-[#3D1A0E] mb-2">Tu carrito está vacío</h2>
          <p className="text-[#7C4A2D] mb-6">Agregá algo rico antes de continuar</p>
          <Link
            to="/"
            className="bg-[#E8889A] text-white font-bold px-8 py-3 rounded-full hover:bg-[#d9768a] transition-colors"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    )
  }

  const selectedZone = zones.find((z) => z.id === Number(form.delivery_zone_id))
  const deliveryCost = form.delivery_method === 'delivery' && selectedZone
    ? Number(selectedZone.price)
    : 0
  const orderTotal = total + deliveryCost
  const deposit = orderTotal * 0.5

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => { const n = { ...e }; delete n[field]; return n })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!form.customer_name.trim()) newErrors.customer_name = 'Ingresá tu nombre.'
    if (!form.customer_phone.trim()) newErrors.customer_phone = 'Ingresá tu teléfono.'
    if (!form.required_date) newErrors.required_date = 'Elegí una fecha para tu pedido.'
    else if (unavailableDates.includes(form.required_date))
      newErrors.required_date = 'Lo sentimos, esa fecha ya está completa. Por favor elegí otra.'
    if (form.delivery_method === 'delivery') {
      if (!form.delivery_zone_id) newErrors.delivery_zone_id = 'Elegí una zona de entrega.'
      if (!form.address_street.trim()) newErrors.address_street = 'Ingresá tu dirección.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    try {
      const order = await createOrder(TENANT, {
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_email: form.customer_email || undefined,
        items: items.map((i) => ({ variant_id: i.variantId, quantity: i.quantity })),
        delivery_method: form.delivery_method,
        delivery_zone_id: form.delivery_method === 'delivery' ? Number(form.delivery_zone_id) : null,
        required_date: form.required_date,
        address_street: form.address_street || undefined,
        address_neighborhood: form.address_neighborhood || undefined,
        notes: form.notes || undefined,
      })
      clear()
      navigate(`/pedido/${order.id}`, { state: { order } })
    } catch (err: unknown) {
      const apiErrors = (err as { response?: { data?: Record<string, string[]> } })?.response?.data
      if (apiErrors) {
        const mapped: Record<string, string> = {}
        for (const [k, v] of Object.entries(apiErrors)) {
          mapped[k] = Array.isArray(v) ? v[0] : String(v)
        }
        setErrors(mapped)
      } else {
        setErrors({ _global: 'Ocurrió un error. Intentá de nuevo.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = (field: string) =>
    `w-full border rounded-xl px-4 py-3 text-sm text-[#3D1A0E] bg-white placeholder-[#C4A882] focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? 'border-red-400 focus:ring-red-200'
        : 'border-[#E8C8A0] focus:ring-[#E8889A]/30 focus:border-[#E8889A]'
    }`

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      {/* Header simple */}
      <header className="bg-[#FDF6EC] border-b border-[#F5E8D0] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/" className="text-[#A0673A] hover:text-[#7C4A2D] text-sm flex items-center gap-1">
            ← Volver
          </Link>
          <span className="text-[#D4A76A]">|</span>
          <span className="font-bold text-[#3D1A0E]">🍫 Dulceras Team</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#3D1A0E] mb-2">Completá tu pedido</h1>
        <p className="text-[#7C4A2D] text-sm mb-8">
          ⏰ Recordá que necesitamos al menos {maxAdvanceHours}h de anticipación.
        </p>

        {errors._global && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
            {errors._global}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Formulario — 3/5 */}
          <div className="md:col-span-3 space-y-6">

            {/* Tus datos */}
            <section className="bg-white rounded-2xl border border-[#F5E8D0] p-5">
              <h2 className="font-bold text-[#3D1A0E] mb-4">Tus datos</h2>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Nombre y apellido *"
                    value={form.customer_name}
                    onChange={(e) => set('customer_name', e.target.value)}
                    className={inputCls('customer_name')}
                  />
                  {errors.customer_name && <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>}
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Teléfono / WhatsApp *"
                    value={form.customer_phone}
                    onChange={(e) => set('customer_phone', e.target.value)}
                    className={inputCls('customer_phone')}
                  />
                  {errors.customer_phone && <p className="text-red-500 text-xs mt-1">{errors.customer_phone}</p>}
                </div>
                <input
                  type="email"
                  placeholder="Email (opcional)"
                  value={form.customer_email}
                  onChange={(e) => set('customer_email', e.target.value)}
                  className={inputCls('customer_email')}
                />
              </div>
            </section>

            {/* Entrega */}
            <section className="bg-white rounded-2xl border border-[#F5E8D0] p-5">
              <h2 className="font-bold text-[#3D1A0E] mb-4">Entrega</h2>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {(['pickup', 'delivery'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => set('delivery_method', m)}
                    className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.delivery_method === m
                        ? 'border-[#E8889A] bg-[#FFF0F3] text-[#E8889A]'
                        : 'border-[#F5E8D0] text-[#7C4A2D] hover:border-[#D4A76A]'
                    }`}
                  >
                    {m === 'pickup' ? '🏪 Retiro en local' : '🚚 Delivery a CABA'}
                  </button>
                ))}
              </div>

              {form.delivery_method === 'pickup' && (
                <p className="text-sm text-[#A0673A] bg-[#F5E8D0] rounded-xl px-4 py-3">
                  📍 Retiro en <strong className="text-[#3D1A0E]">Almagro, CABA</strong>.
                  Te avisamos cuando está listo.
                </p>
              )}

              {form.delivery_method === 'delivery' && (
                <div className="space-y-3">
                  <div>
                    <select
                      value={form.delivery_zone_id}
                      onChange={(e) => set('delivery_zone_id', e.target.value)}
                      className={inputCls('delivery_zone_id')}
                    >
                      <option value="">Zona de entrega *</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name} — ${Number(z.price).toLocaleString('es-AR')}
                        </option>
                      ))}
                    </select>
                    {errors.delivery_zone_id && <p className="text-red-500 text-xs mt-1">{errors.delivery_zone_id}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Calle y número *"
                      value={form.address_street}
                      onChange={(e) => set('address_street', e.target.value)}
                      className={inputCls('address_street')}
                    />
                    {errors.address_street && <p className="text-red-500 text-xs mt-1">{errors.address_street}</p>}
                  </div>
                  <input
                    type="text"
                    placeholder="Barrio (opcional)"
                    value={form.address_neighborhood}
                    onChange={(e) => set('address_neighborhood', e.target.value)}
                    className={inputCls('address_neighborhood')}
                  />
                </div>
              )}
            </section>

            {/* Fecha */}
            <section className="bg-white rounded-2xl border border-[#F5E8D0] p-5">
              <h2 className="font-bold text-[#3D1A0E] mb-1">¿Cuándo lo necesitás?</h2>
              <p className="text-xs text-[#A0673A] mb-3">
                Mínimo {maxAdvanceHours}h de anticipación
              </p>
              <input
                type="date"
                min={minDate(maxAdvanceHours)}
                value={form.required_date}
                onChange={(e) => {
                  set('required_date', e.target.value)
                  if (unavailableDates.includes(e.target.value)) {
                    setErrors(err => ({ ...err, required_date: 'Lo sentimos, esa fecha ya está completa. Por favor elegí otra.' }))
                  }
                }}
                className={inputCls('required_date')}
              />
              {errors.required_date && <p className="text-red-500 text-xs mt-1">{errors.required_date}</p>}
              {form.required_date && !errors.required_date && unavailableDates.includes(form.required_date) === false && (
                <p className="text-green-600 text-xs mt-1">✓ Fecha disponible</p>
              )}
            </section>

            {/* Notas */}
            <section className="bg-white rounded-2xl border border-[#F5E8D0] p-5">
              <h2 className="font-bold text-[#3D1A0E] mb-3">¿Alguna aclaración?</h2>
              <textarea
                placeholder="Alergias, dedicatorias, preferencias..."
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                rows={3}
                className={`${inputCls('notes')} resize-none`}
              />
            </section>
          </div>

          {/* Resumen — 2/5 */}
          <div className="md:col-span-2">
            <div className="sticky top-6 bg-white rounded-2xl border border-[#F5E8D0] p-5">
              <h2 className="font-bold text-[#3D1A0E] mb-4">Tu pedido</h2>

              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.variantId} className="flex justify-between text-sm">
                    <span className="text-[#7C4A2D] flex-1 pr-2">
                      {item.productName} <span className="text-[#A0673A]">×{item.quantity}</span>
                      <br />
                      <span className="text-xs text-[#C4A882]">{item.variantName}</span>
                    </span>
                    <span className="font-semibold text-[#3D1A0E] whitespace-nowrap">
                      ${(item.price * item.quantity).toLocaleString('es-AR')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#F5E8D0] pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-[#7C4A2D]">
                  <span>Subtotal</span>
                  <span>${total.toLocaleString('es-AR')}</span>
                </div>
                {form.delivery_method === 'delivery' && (
                  <div className="flex justify-between text-[#7C4A2D]">
                    <span>Delivery</span>
                    <span>
                      {deliveryCost > 0
                        ? `$${deliveryCost.toLocaleString('es-AR')}`
                        : 'Seleccioná zona'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-[#3D1A0E] text-base pt-1 border-t border-[#F5E8D0]">
                  <span>Total</span>
                  <span>${orderTotal.toLocaleString('es-AR')}</span>
                </div>
              </div>

              <div className="mt-4 bg-[#F7D0D8] rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-[#7C4A2D] mb-0.5">Seña a pagar ahora</p>
                <p className="text-xl font-bold text-[#E8889A]">
                  ${deposit.toLocaleString('es-AR')}
                </p>
                <p className="text-xs text-[#A0673A] mt-0.5">50% del total</p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-5 bg-[#E8889A] hover:bg-[#d9768a] disabled:opacity-60 text-white font-bold py-4 rounded-full transition-colors shadow-md text-base"
              >
                {submitting ? 'Enviando...' : 'Confirmar pedido 🎉'}
              </button>
              <p className="text-center text-xs text-[#A0673A] mt-2">
                Luego te avisamos para pagar la seña por MP
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

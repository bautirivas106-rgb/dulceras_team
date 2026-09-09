import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { getDeliveryZones, createOrder, getDateAvailability } from '../../api/orders'
import { validateCoupon } from '../../api/couponsApi'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import type { DeliveryZone } from '../../types/orders'
import { AlertCircle, CheckCircle, Clock, MapPin, Tag, Truck, ShoppingBag } from 'lucide-react'

const TENANT = 'dulceras-team'

function minDate(advanceHours: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + Math.ceil(advanceHours / 24))
  return d.toISOString().split('T')[0]
}

const cardStyle = {
  background: '#fff',
  borderRadius: 20,
  border: '1px solid rgba(58,36,23,0.08)',
  boxShadow: '0 4px 20px rgba(58,36,23,0.06)',
  padding: '22px 24px',
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-fraunces font-bold text-brown" style={{ fontSize: '1.1rem', marginBottom: 16 }}>
      {children}
    </h2>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p className="flex items-center gap-1 text-xs mt-1.5" style={{ color: '#C0392B' }}>
      <AlertCircle size={11} style={{ flexShrink: 0 }} />
      {msg}
    </p>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, total, maxAdvanceHours, clear } = useCart()
  const { customer } = useCustomerAuth()

  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [unavailableDates, setUnavailableDates] = useState<string[]>([])
  const [form, setForm] = useState({
    customer_name: customer?.name ?? '',
    customer_phone: customer?.phone ?? '',
    customer_email: customer?.email ?? '',
    delivery_method: 'pickup' as 'pickup' | 'delivery',
    delivery_zone_id: '',
    required_date: '',
    address_street: '',
    address_neighborhood: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  useEffect(() => {
    getDeliveryZones(TENANT).then(setZones).catch(() => {})
    getDateAvailability(TENANT)
      .then(({ unavailable }) => setUnavailableDates(unavailable))
      .catch(() => {})
  }, [])

  if (items.length === 0) {
    return (
      <div className="min-h-screen font-poppins flex items-center justify-center px-4" style={{ background: '#FDF6EC' }}>
        <div className="text-center">
          <div
            className="mx-auto flex items-center justify-center rounded-full mb-5"
            style={{ width: 80, height: 80, background: '#F6EAD6' }}
          >
            <ShoppingBag size={32} style={{ color: '#E285AF' }} />
          </div>
          <h2 className="font-fraunces font-bold text-brown mb-2" style={{ fontSize: '1.6rem' }}>
            Tu carrito está vacío
          </h2>
          <p className="text-brown-soft mb-6 text-sm">Agregá algo rico antes de continuar</p>
          <Link
            to="/"
            className="inline-block text-sm font-semibold text-white rounded-full px-8 py-3"
            style={{ background: 'linear-gradient(135deg, #F0A0C4, #E285AF)', boxShadow: '0 6px 18px rgba(226,133,175,0.45)' }}
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    )
  }

  const selectedZone = zones.find((z) => z.id === Number(form.delivery_zone_id))
  const deliveryCost = form.delivery_method === 'delivery' && selectedZone ? Number(selectedZone.price) : 0
  const discount = couponApplied?.discount ?? 0
  const orderTotal = total + deliveryCost - discount
  const deposit = orderTotal * 0.5

  async function applyCoupon() {
    const code = couponInput.trim()
    if (!code) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const result = await validateCoupon(TENANT, code, total + deliveryCost)
      if (result.valid) {
        setCouponApplied({ code: result.code!, discount: result.discount_amount! })
        setCouponError('')
      } else {
        setCouponApplied(null)
        setCouponError(result.error ?? 'Cupón inválido.')
      }
    } catch {
      setCouponError('No se pudo validar el cupón.')
    } finally {
      setCouponLoading(false)
    }
  }

  function removeCoupon() {
    setCouponApplied(null)
    setCouponInput('')
    setCouponError('')
  }

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

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

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
        coupon_code: couponApplied?.code || undefined,
      })
      clear()
      navigate(`/pedido/${order.id}`, { state: { order } })
    } catch (err: unknown) {
      const apiErrors = (err as { response?: { data?: Record<string, string[]> } })?.response?.data
      if (apiErrors) {
        const mapped: Record<string, string> = {}
        for (const [k, v] of Object.entries(apiErrors)) mapped[k] = Array.isArray(v) ? v[0] : String(v)
        setErrors(mapped)
      } else {
        setErrors({ _global: 'Ocurrió un error. Intentá de nuevo.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  function inputStyle(field: string): React.CSSProperties {
    return {
      width: '100%', borderRadius: 12, padding: '11px 16px', fontSize: '0.875rem',
      color: '#3A2417', background: '#fff', outline: 'none',
      border: errors[field] ? '1.5px solid #E74C3C' : '1.5px solid rgba(58,36,23,0.15)',
      transition: 'border-color 0.2s',
    }
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, field: string) {
    e.currentTarget.style.borderColor = errors[field] ? '#E74C3C' : '#E285AF'
  }
  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, field: string) {
    e.currentTarget.style.borderColor = errors[field] ? '#E74C3C' : 'rgba(58,36,23,0.15)'
  }

  return (
    <div className="min-h-screen font-poppins" style={{ background: '#FDF6EC' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10"
        style={{ background: 'rgba(253,246,236,0.95)', borderBottom: '1px solid rgba(58,36,23,0.08)', backdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: '#E285AF' }}
          >
            ← Volver
          </Link>
          <span style={{ color: 'rgba(58,36,23,0.2)' }}>|</span>
          <div className="flex items-center gap-2">
            <img src="/brand/logo-icon.png" alt="" style={{ height: 28, width: 'auto' }} />
            <img src="/brand/logo-wordmark.png" alt="Dulceras Team" style={{ height: 22, width: 'auto' }} />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-7">
          <h1 className="font-fraunces font-bold text-brown" style={{ fontSize: 'clamp(1.6rem, 4vw, 2rem)' }}>
            Completá tu pedido
          </h1>
          <p className="text-brown-soft text-sm flex items-center gap-1.5 mt-1">
            <Clock size={13} />
            Necesitamos al menos {maxAdvanceHours}h de anticipación.
          </p>
        </div>

        {errors._global && (
          <div
            className="flex items-center gap-2.5 text-sm rounded-xl px-4 py-3 mb-6"
            style={{ background: '#FFF0F0', border: '1px solid rgba(231,76,60,0.25)', color: '#C0392B' }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {errors._global}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-6">

          {/* ── Formulario 3/5 ── */}
          <div className="md:col-span-3 space-y-5">

            {/* Tus datos */}
            <section style={cardStyle}>
              <SectionTitle>Tus datos</SectionTitle>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Nombre y apellido *"
                    value={form.customer_name}
                    onChange={(e) => set('customer_name', e.target.value)}
                    style={inputStyle('customer_name')}
                    onFocus={(e) => handleFocus(e, 'customer_name')}
                    onBlur={(e) => handleBlur(e, 'customer_name')}
                  />
                  <FieldError msg={errors.customer_name} />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Teléfono / WhatsApp *"
                    value={form.customer_phone}
                    onChange={(e) => set('customer_phone', e.target.value)}
                    style={inputStyle('customer_phone')}
                    onFocus={(e) => handleFocus(e, 'customer_phone')}
                    onBlur={(e) => handleBlur(e, 'customer_phone')}
                  />
                  <FieldError msg={errors.customer_phone} />
                </div>
                <input
                  type="email"
                  placeholder="Email (opcional)"
                  value={form.customer_email}
                  onChange={(e) => set('customer_email', e.target.value)}
                  style={inputStyle('customer_email')}
                  onFocus={(e) => handleFocus(e, 'customer_email')}
                  onBlur={(e) => handleBlur(e, 'customer_email')}
                />
              </div>
            </section>

            {/* Entrega */}
            <section style={cardStyle}>
              <SectionTitle>Entrega</SectionTitle>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {(['pickup', 'delivery'] as const).map((m) => {
                  const active = form.delivery_method === m
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set('delivery_method', m)}
                      className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                      style={active ? {
                        background: 'linear-gradient(135deg, #F0A0C4, #E285AF)',
                        color: '#fff',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(226,133,175,0.35)',
                      } : {
                        background: '#fff',
                        color: '#5A3B29',
                        border: '1.5px solid rgba(58,36,23,0.15)',
                      }}
                    >
                      {m === 'pickup'
                        ? <><ShoppingBag size={15} /> Retiro en local</>
                        : <><Truck size={15} /> Delivery a CABA</>}
                    </button>
                  )
                })}
              </div>

              {form.delivery_method === 'pickup' && (
                <div
                  className="flex items-center gap-2.5 text-sm rounded-xl px-4 py-3"
                  style={{ background: '#F6EAD6', color: '#5A3B29' }}
                >
                  <MapPin size={14} style={{ color: '#E285AF', flexShrink: 0 }} />
                  Retiro en <strong className="text-brown ml-1">Almagro, CABA</strong>.
                  <span className="ml-1 text-brown-soft">Te avisamos cuando está listo.</span>
                </div>
              )}

              {form.delivery_method === 'delivery' && (
                <div className="space-y-3">
                  <div>
                    <select
                      value={form.delivery_zone_id}
                      onChange={(e) => set('delivery_zone_id', e.target.value)}
                      style={inputStyle('delivery_zone_id')}
                      onFocus={(e) => handleFocus(e, 'delivery_zone_id')}
                      onBlur={(e) => handleBlur(e, 'delivery_zone_id')}
                    >
                      <option value="">Zona de entrega *</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name} — ${Number(z.price).toLocaleString('es-AR')}
                        </option>
                      ))}
                    </select>
                    <FieldError msg={errors.delivery_zone_id} />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Calle y número *"
                      value={form.address_street}
                      onChange={(e) => set('address_street', e.target.value)}
                      style={inputStyle('address_street')}
                      onFocus={(e) => handleFocus(e, 'address_street')}
                      onBlur={(e) => handleBlur(e, 'address_street')}
                    />
                    <FieldError msg={errors.address_street} />
                  </div>
                  <input
                    type="text"
                    placeholder="Barrio (opcional)"
                    value={form.address_neighborhood}
                    onChange={(e) => set('address_neighborhood', e.target.value)}
                    style={inputStyle('address_neighborhood')}
                    onFocus={(e) => handleFocus(e, 'address_neighborhood')}
                    onBlur={(e) => handleBlur(e, 'address_neighborhood')}
                  />
                </div>
              )}
            </section>

            {/* Fecha */}
            <section style={cardStyle}>
              <SectionTitle>¿Cuándo lo necesitás?</SectionTitle>
              <p className="text-brown-soft text-xs mb-3 flex items-center gap-1">
                <Clock size={11} />
                Mínimo {maxAdvanceHours}h de anticipación
              </p>
              <input
                type="date"
                min={minDate(maxAdvanceHours)}
                value={form.required_date}
                onChange={(e) => {
                  set('required_date', e.target.value)
                  if (unavailableDates.includes(e.target.value))
                    setErrors(err => ({ ...err, required_date: 'Lo sentimos, esa fecha ya está completa. Por favor elegí otra.' }))
                }}
                style={inputStyle('required_date')}
                onFocus={(e) => handleFocus(e, 'required_date')}
                onBlur={(e) => handleBlur(e, 'required_date')}
              />
              <FieldError msg={errors.required_date} />
              {form.required_date && !errors.required_date && !unavailableDates.includes(form.required_date) && (
                <p className="flex items-center gap-1 text-xs mt-1.5" style={{ color: '#27AE60' }}>
                  <CheckCircle size={11} /> Fecha disponible
                </p>
              )}
            </section>

            {/* Notas */}
            <section style={cardStyle}>
              <SectionTitle>¿Alguna aclaración?</SectionTitle>
              <textarea
                placeholder="Alergias, dedicatorias, preferencias..."
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                rows={3}
                style={{ ...inputStyle('notes'), resize: 'none' } as React.CSSProperties}
                onFocus={(e) => handleFocus(e, 'notes')}
                onBlur={(e) => handleBlur(e, 'notes')}
              />
            </section>
          </div>

          {/* ── Resumen 2/5 ── */}
          <div className="md:col-span-2">
            <div className="sticky top-20" style={cardStyle}>
              <SectionTitle>Tu pedido</SectionTitle>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.variantId} className="flex justify-between text-sm gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-brown font-medium truncate">{item.productName}</p>
                      <p className="text-brown-soft text-xs opacity-70">
                        {item.variantName} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-brown whitespace-nowrap text-sm">
                      ${(item.price * item.quantity).toLocaleString('es-AR')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divisor */}
              <div style={{ borderTop: '1px solid rgba(58,36,23,0.07)', marginBottom: 14 }} />

              {/* Cupón */}
              {!couponApplied ? (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#E285AF' }} />
                      <input
                        type="text"
                        placeholder="Código de descuento"
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value); setCouponError('') }}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
                        style={{ ...inputStyle('_coupon'), paddingLeft: 32 } as React.CSSProperties}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#E285AF' }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(58,36,23,0.15)' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="text-sm font-semibold px-3 rounded-xl transition-opacity disabled:opacity-50"
                      style={{ background: '#F6EAD6', color: '#5A3B29', border: 'none' }}
                    >
                      {couponLoading ? '...' : 'Aplicar'}
                    </button>
                  </div>
                  {couponError && <FieldError msg={couponError} />}
                </div>
              ) : (
                <div
                  className="mb-4 flex items-center justify-between rounded-xl px-3 py-2"
                  style={{ background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.2)' }}
                >
                  <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#27AE60' }}>
                    <CheckCircle size={13} /> {couponApplied.code}
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs transition-opacity hover:opacity-60"
                    style={{ color: '#27AE60', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Quitar
                  </button>
                </div>
              )}

              {/* Totales */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-brown-soft">
                  <span>Subtotal</span>
                  <span>${total.toLocaleString('es-AR')}</span>
                </div>
                {form.delivery_method === 'delivery' && (
                  <div className="flex justify-between text-brown-soft">
                    <span>Delivery</span>
                    <span>
                      {deliveryCost > 0 ? `$${deliveryCost.toLocaleString('es-AR')}` : 'Elegí zona'}
                    </span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between font-semibold" style={{ color: '#27AE60' }}>
                    <span>Descuento ({couponApplied!.code})</span>
                    <span>−${discount.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div
                  className="flex justify-between font-bold text-brown text-base pt-2"
                  style={{ borderTop: '1px solid rgba(58,36,23,0.07)', marginTop: 6 }}
                >
                  <span>Total</span>
                  <span>${orderTotal.toLocaleString('es-AR')}</span>
                </div>
              </div>

              {/* Seña */}
              <div
                className="mt-4 rounded-xl px-4 py-3"
                style={{ background: 'linear-gradient(135deg, rgba(240,160,196,0.18), rgba(246,234,214,0.6))' }}
              >
                <p className="text-xs font-semibold text-brown-soft mb-0.5">Seña a pagar ahora</p>
                <p className="font-fraunces font-bold" style={{ fontSize: '1.5rem', color: '#E285AF' }}>
                  ${deposit.toLocaleString('es-AR')}
                </p>
                <p className="text-xs text-brown-soft opacity-70 mt-0.5">50% del total · vía Mercado Pago</p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-5 text-white font-semibold py-4 rounded-full text-sm transition-all"
                style={{
                  background: submitting ? 'rgba(226,133,175,0.6)' : 'linear-gradient(135deg, #F0A0C4, #E285AF)',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: submitting ? 'none' : '0 8px 24px rgba(226,133,175,0.45)',
                }}
                onMouseEnter={e => {
                  if (!submitting) e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = ''
                }}
              >
                {submitting ? 'Enviando...' : 'Confirmar pedido 🎉'}
              </button>
              <p className="text-center text-xs text-brown-soft mt-2 opacity-70">
                Luego te avisamos para pagar la seña por MP
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

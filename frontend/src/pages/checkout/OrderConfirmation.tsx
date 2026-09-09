import { useEffect, useState } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import type { OrderDetail } from '../../types/orders'
import { initiatePayment } from '../../api/payments'
import { getOrder } from '../../api/orders'
import { CheckCircle, Calendar, Truck, ShoppingBag, AlertCircle, MessageCircle } from 'lucide-react'

const TENANT = 'dulceras-team'

const cardStyle = {
  background: '#fff',
  borderRadius: 20,
  border: '1px solid rgba(58,36,23,0.08)',
  boxShadow: '0 4px 20px rgba(58,36,23,0.06)',
  padding: '22px 24px',
}

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>()
  const { state } = useLocation() as { state: { order: OrderDetail } | null }

  const [order, setOrder] = useState<OrderDetail | null>(state?.order ?? null)
  const [loadError, setLoadError] = useState(false)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')

  useEffect(() => {
    if (!order && id) {
      getOrder(TENANT, Number(id))
        .then(setOrder)
        .catch(() => setLoadError(true))
    }
  }, [id, order])

  if (loadError) {
    return (
      <div className="min-h-screen font-poppins flex items-center justify-center px-4" style={{ background: '#FDF6EC' }}>
        <div className="text-center">
          <div
            className="mx-auto flex items-center justify-center rounded-full mb-5"
            style={{ width: 72, height: 72, background: '#F6EAD6' }}
          >
            <AlertCircle size={30} style={{ color: '#E285AF' }} />
          </div>
          <h2 className="font-fraunces font-bold text-brown mb-2" style={{ fontSize: '1.4rem' }}>
            No encontramos el pedido
          </h2>
          <p className="text-brown-soft text-sm mb-6">Puede que el link haya expirado o sea incorrecto.</p>
          <Link
            to="/"
            className="inline-block text-sm font-semibold text-white rounded-full px-8 py-3"
            style={{ background: 'linear-gradient(135deg, #F0A0C4, #E285AF)', boxShadow: '0 6px 18px rgba(226,133,175,0.35)' }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen font-poppins flex items-center justify-center" style={{ background: '#FDF6EC' }}>
        <div
          className="rounded-full border-4 border-t-transparent animate-spin"
          style={{ width: 40, height: 40, borderColor: '#E285AF', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  const formattedDate = new Date(order.required_date + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  async function handlePay() {
    setPaying(true)
    setPayError('')
    try {
      const result = await initiatePayment(order!.id)
      const url = result.sandbox_init_point || result.init_point
      if (url) {
        window.location.href = url
      } else {
        setPayError(result.detail || 'No se pudo iniciar el pago.')
        setPaying(false)
      }
    } catch {
      setPayError('Error al conectar con Mercado Pago. Intentá de nuevo.')
      setPaying(false)
    }
  }

  const isPaid = !['pending_deposit'].includes(order.status)
  const depositPct = order.deposit_percentage ?? 50

  return (
    <div className="min-h-screen font-poppins" style={{ background: '#FDF6EC' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10"
        style={{ background: 'rgba(253,246,236,0.95)', borderBottom: '1px solid rgba(58,36,23,0.08)', backdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-lg mx-auto px-5 h-14 flex items-center gap-2">
          <img src="/brand/logo-icon.png" alt="" style={{ height: 28, width: 'auto' }} />
          <img src="/brand/logo-wordmark.png" alt="Dulceras Team" style={{ height: 22, width: 'auto' }} />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-10 space-y-5">

        {/* Hero de confirmación */}
        <div className="text-center py-6">
          <div
            className="mx-auto flex items-center justify-center rounded-full mb-5"
            style={{
              width: 80, height: 80,
              background: isPaid
                ? 'linear-gradient(135deg, #F0A0C4, #E285AF)'
                : 'linear-gradient(135deg, rgba(240,160,196,0.25), rgba(246,234,214,0.8))',
              boxShadow: isPaid ? '0 8px 24px rgba(226,133,175,0.35)' : 'none',
            }}
          >
            <CheckCircle size={36} style={{ color: isPaid ? '#fff' : '#E285AF' }} strokeWidth={1.8} />
          </div>
          <h1 className="font-fraunces font-bold text-brown mb-2" style={{ fontSize: 'clamp(1.6rem, 5vw, 2rem)' }}>
            {isPaid ? '¡Seña confirmada!' : '¡Pedido recibido!'}
          </h1>
          <p className="text-brown-soft text-sm" style={{ maxWidth: 320, margin: '0 auto' }}>
            {isPaid
              ? 'Tu pago fue procesado. Nos ponemos en contacto pronto.'
              : 'Para confirmar tu lugar, pagá la seña ahora por Mercado Pago.'}
          </p>
        </div>

        {/* Card resumen */}
        <div style={cardStyle}>
          {/* N° y estado */}
          <div
            className="flex items-center justify-between pb-4 mb-4"
            style={{ borderBottom: '1px solid rgba(58,36,23,0.07)' }}
          >
            <div>
              <p
                className="font-semibold uppercase"
                style={{ fontSize: '0.7rem', letterSpacing: '0.07em', color: '#5A3B29', opacity: 0.6, marginBottom: 2 }}
              >
                N° de pedido
              </p>
              <p className="font-fraunces font-bold text-brown" style={{ fontSize: '1.6rem', lineHeight: 1 }}>
                #{order.id}
              </p>
            </div>
            <span
              className="text-xs font-semibold rounded-full px-3 py-1.5"
              style={{ background: 'rgba(240,160,196,0.18)', color: '#C25D8A' }}
            >
              {order.status_display}
            </span>
          </div>

          {/* Items */}
          <div className="space-y-3 mb-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brown leading-tight">{item.product_name}</p>
                  <p className="text-brown-soft opacity-60 text-xs mt-0.5">{item.variant_name} × {item.quantity}</p>
                </div>
                <span className="font-semibold text-brown whitespace-nowrap">
                  ${Number(item.subtotal).toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>

          {/* Detalles */}
          <div
            className="space-y-2 pt-3 mt-3 text-sm"
            style={{ borderTop: '1px solid rgba(58,36,23,0.07)' }}
          >
            <div className="flex items-center justify-between text-brown-soft">
              <span className="flex items-center gap-1.5">
                {order.delivery_method === 'delivery' ? <Truck size={13} /> : <ShoppingBag size={13} />}
                Entrega
              </span>
              <span>{order.delivery_method_display}</span>
            </div>
            <div className="flex items-center justify-between text-brown-soft">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                Fecha
              </span>
              <span className="capitalize">{formattedDate}</span>
            </div>
            {Number(order.delivery_cost) > 0 && (
              <div className="flex justify-between text-brown-soft">
                <span>Delivery</span>
                <span>${Number(order.delivery_cost).toLocaleString('es-AR')}</span>
              </div>
            )}
            {Number(order.discount_amount) > 0 && (
              <div className="flex justify-between font-semibold" style={{ color: '#27AE60' }}>
                <span>Descuento</span>
                <span>−${Number(order.discount_amount).toLocaleString('es-AR')}</span>
              </div>
            )}
            <div
              className="flex justify-between font-bold text-brown pt-2"
              style={{ borderTop: '1px solid rgba(58,36,23,0.07)', fontSize: '0.95rem' }}
            >
              <span>Total</span>
              <span>${Number(order.total).toLocaleString('es-AR')}</span>
            </div>
          </div>

          {/* Seña */}
          <div
            className="mt-4 rounded-2xl px-4 py-4 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(240,160,196,0.18), rgba(246,234,214,0.6))' }}
          >
            <p className="text-xs font-semibold text-brown-soft mb-1">Seña a pagar ahora</p>
            <p className="font-fraunces font-bold" style={{ fontSize: '2rem', color: '#E285AF', lineHeight: 1 }}>
              ${Number(order.deposit_amount).toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-brown-soft opacity-60 mt-1">{depositPct}% del total · vía Mercado Pago</p>
          </div>
        </div>

        {/* Error de pago */}
        {payError && (
          <div
            className="flex items-center gap-2.5 text-sm rounded-xl px-4 py-3"
            style={{ background: '#FFF0F0', border: '1px solid rgba(231,76,60,0.25)', color: '#C0392B' }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {payError}
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-3 pb-6">
          {!isPaid && (
            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full text-white font-semibold py-4 rounded-full text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: paying ? 'rgba(0,158,227,0.6)' : '#009ee3',
                border: 'none',
                cursor: paying ? 'not-allowed' : 'pointer',
                boxShadow: paying ? 'none' : '0 6px 18px rgba(0,158,227,0.35)',
              }}
              onMouseEnter={e => { if (!paying) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = '' }}
            >
              {paying ? (
                <>
                  <span
                    className="rounded-full border-2 border-t-transparent animate-spin"
                    style={{ width: 16, height: 16, borderColor: 'rgba(255,255,255,0.6)', borderTopColor: 'transparent' }}
                  />
                  Redirigiendo a Mercado Pago...
                </>
              ) : (
                <>💳 Pagar seña con Mercado Pago</>
              )}
            </button>
          )}

          <a
            href={`https://wa.me/5491100000000?text=Hola%21+Hice+el+pedido+%23${order.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full font-semibold py-3.5 rounded-full text-center text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: '#25D366',
              color: '#fff',
              border: 'none',
              boxShadow: '0 4px 14px rgba(37,211,102,0.3)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = '' }}
          >
            <MessageCircle size={16} />
            Consultar por WhatsApp
          </a>

          <Link
            to="/"
            className="w-full font-semibold py-3.5 rounded-full text-center text-sm transition-all"
            style={{
              background: '#F6EAD6',
              color: '#5A3B29',
              border: 'none',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#EDD9B8' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#F6EAD6' }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

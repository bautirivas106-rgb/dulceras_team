import { useEffect, useState } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import type { OrderDetail } from '../../types/orders'
import { initiatePayment } from '../../api/payments'
import { getOrder } from '../../api/orders'

const TENANT = 'dulceras-team'

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
      <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🤔</div>
          <p className="text-[#7C4A2D] mb-4">No encontramos información del pedido.</p>
          <Link to="/" className="text-[#E8889A] font-semibold hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E8889A] border-t-transparent rounded-full animate-spin" />
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

  return (
    <div className="min-h-screen bg-[#FDF6EC] px-4 py-12">
      <div className="max-w-md mx-auto">

        {/* Éxito */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
            {isPaid ? '🎉' : '✅'}
          </div>
          <h1 className="text-2xl font-bold text-[#3D1A0E] mb-2">
            {isPaid ? '¡Seña confirmada!' : '¡Pedido recibido!'}
          </h1>
          <p className="text-[#7C4A2D]">
            {isPaid
              ? 'Tu pago fue procesado. ¡Nos ponemos en contacto pronto!'
              : 'Para confirmar tu lugar, pagá la seña ahora por Mercado Pago.'}
          </p>
        </div>

        {/* Card del pedido */}
        <div className="bg-white rounded-2xl border border-[#F5E8D0] p-6 mb-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#F5E8D0]">
            <div>
              <p className="text-xs text-[#A0673A] font-semibold uppercase tracking-wide">N° de pedido</p>
              <p className="text-2xl font-bold text-[#3D1A0E]">#{order.id}</p>
            </div>
            <span className="bg-[#F7D0D8] text-[#7C4A2D] text-xs font-semibold px-3 py-1.5 rounded-full">
              {order.status_display}
            </span>
          </div>

          {/* Items */}
          <div className="space-y-2 mb-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-[#7C4A2D] flex-1 pr-2">
                  {item.product_name} ×{item.quantity}
                  <span className="block text-xs text-[#C4A882]">{item.variant_name}</span>
                </span>
                <span className="font-semibold text-[#3D1A0E] whitespace-nowrap">
                  ${Number(item.subtotal).toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#F5E8D0] pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-[#7C4A2D]">
              <span>Entrega</span>
              <span>{order.delivery_method_display}</span>
            </div>
            <div className="flex justify-between text-[#7C4A2D]">
              <span>Fecha</span>
              <span className="capitalize">{formattedDate}</span>
            </div>
            {Number(order.delivery_cost) > 0 && (
              <div className="flex justify-between text-[#7C4A2D]">
                <span>Delivery</span>
                <span>${Number(order.delivery_cost).toLocaleString('es-AR')}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-[#3D1A0E] text-base pt-2 border-t border-[#F5E8D0]">
              <span>Total</span>
              <span>${Number(order.total).toLocaleString('es-AR')}</span>
            </div>
          </div>

          {/* Seña */}
          <div className="mt-4 bg-[#F7D0D8] rounded-xl px-4 py-4 text-center">
            <p className="text-xs font-semibold text-[#7C4A2D] mb-1">Seña</p>
            <p className="text-3xl font-bold text-[#E8889A]">
              ${Number(order.deposit_amount).toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-[#A0673A] mt-1">50% del total</p>
          </div>
        </div>

        {/* Error de pago */}
        {payError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
            {payError}
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          {!isPaid && (
            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full bg-[#009ee3] hover:bg-[#007ab8] disabled:opacity-60 text-white font-bold py-4 rounded-full transition-colors shadow-md text-base flex items-center justify-center gap-2"
            >
              {paying ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Redirigiendo a Mercado Pago...
                </>
              ) : (
                <>💳 Pagar seña con Mercado Pago</>
              )}
            </button>
          )}

          <a
            href={`https://wa.me/5491100000000?text=Hola! Hice el pedido %23${order.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-full text-center transition-colors"
          >
            💬 Consultar por WhatsApp
          </a>

          <Link
            to="/"
            className="w-full border-2 border-[#D4A76A] text-[#7C4A2D] font-semibold py-3.5 rounded-full text-center hover:bg-[#F5E8D0] transition-colors"
          >
            Volver al inicio
          </Link>
        </div>

        <p className="text-center text-xs text-[#C4A882] mt-6">
          🐱 Gracias por tu pedido. Ayudaste a un gatito hoy.
        </p>
      </div>
    </div>
  )
}

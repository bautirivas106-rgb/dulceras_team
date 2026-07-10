import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getBilling, payBilling, type Subscription } from '../../../api/billingApi'

const STATUS_CONFIG = {
  trial: { label: 'Trial', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  active: { label: 'Activo', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  overdue: { label: 'Vencido', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  cancelled: { label: 'Cancelado', bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
}

function StatusBadge({ status }: { status: Subscription['status'] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.cancelled
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  )
}

export default function BillingPage() {
  const [sub, setSub] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [searchParams] = useSearchParams()

  const paid = searchParams.get('paid') === '1'
  const failed = searchParams.get('failed') === '1'

  useEffect(() => {
    getBilling()
      .then(r => setSub(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handlePay() {
    setPaying(true)
    try {
      const r = await payBilling()
      const url = r.data.init_point || r.data.sandbox_init_point
      if (url) {
        window.location.href = url
      } else {
        alert('No se pudo generar el link de pago. Verificá la configuración de Mercado Pago.')
      }
    } catch {
      alert('Error al generar el link de pago.')
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#E8889A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!sub) {
    return <p className="p-6 text-red-500">No se pudo cargar la información de facturación.</p>
  }

  const isPaid = Number(sub.plan_price) === 0
  const needsPayment = sub.status === 'overdue' || (sub.status === 'trial' && (sub.days_remaining ?? 0) <= 0)
  const periodEnd = sub.status === 'active' ? sub.current_period_end : sub.trial_ends_at

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Facturación</h1>
        <p className="text-sm text-gray-500 mt-0.5">Estado de tu suscripción y pagos.</p>
      </div>

      {paid && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-5 py-4 text-sm font-medium">
          ¡Pago recibido! Tu suscripción fue activada.
        </div>
      )}
      {failed && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm font-medium">
          El pago no pudo completarse. Intentá de nuevo.
        </div>
      )}

      {/* Plan card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Plan actual</p>
            <h2 className="text-2xl font-bold text-gray-900">{sub.plan_name ?? 'Sin plan'}</h2>
            {sub.plan_price && (
              <p className="text-gray-500 text-sm mt-1">
                {Number(sub.plan_price) === 0
                  ? 'Gratis — sin costo mensual'
                  : `$${Number(sub.plan_price).toLocaleString('es-AR')}/mes`}
              </p>
            )}
          </div>
          <StatusBadge status={sub.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
          {sub.days_remaining !== null && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">
                {sub.status === 'trial' ? 'Días de trial restantes' : 'Días hasta vencimiento'}
              </p>
              <p className={`text-xl font-bold ${sub.days_remaining <= 3 ? 'text-red-600' : 'text-gray-800'}`}>
                {sub.days_remaining}
              </p>
            </div>
          )}
          {periodEnd && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">
                {sub.status === 'trial' ? 'Trial vence el' : 'Período hasta'}
              </p>
              <p className="text-base font-semibold text-gray-800">
                {new Date(periodEnd).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment action */}
      {!isPaid && !sub.plan_name && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
          No tenés un plan asignado. Contactá al administrador de la plataforma para asignarte uno.
        </div>
      )}

      {!isPaid && sub.plan_name && sub.status !== 'cancelled' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-2">
            {sub.status === 'active' ? 'Renovar suscripción' : 'Activar suscripción'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {sub.status === 'trial'
              ? `Tu período de prueba ${(sub.days_remaining ?? 0) > 0 ? `vence en ${sub.days_remaining} días` : 'ha vencido'}. Activá tu plan para seguir usando la plataforma.`
              : sub.status === 'overdue'
              ? 'Tu suscripción está vencida. Realizá el pago para volver a tener acceso completo.'
              : 'Podés renovar tu suscripción anticipadamente.'}
          </p>
          <button
            onClick={handlePay}
            disabled={paying}
            className="bg-[#3D1A0E] text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-[#5C2A18] transition-colors disabled:opacity-60"
          >
            {paying
              ? 'Redirigiendo a Mercado Pago...'
              : `Pagar $${Number(sub.plan_price).toLocaleString('es-AR')}/mes con Mercado Pago`}
          </button>
        </div>
      )}

      {isPaid && (
        <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-4 text-sm text-green-800">
          Tu plan actual es gratuito. No hay cobros mensuales.
        </div>
      )}
    </div>
  )
}

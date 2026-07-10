import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getPaymentStatus } from '../../api/payments'

export default function PaymentSuccess() {
  const [params] = useSearchParams()
  const orderId = Number(params.get('order_id'))
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) { setLoading(false); return }
    // Poll hasta 3 veces con 2s de espera — el webhook puede tardar unos segundos
    let attempts = 0
    const check = async () => {
      try {
        const data = await getPaymentStatus(orderId)
        setStatus(data.status)
        if (data.status === 'pending' && attempts < 3) {
          attempts++
          setTimeout(check, 2000)
        } else {
          setLoading(false)
        }
      } catch {
        setLoading(false)
      }
    }
    check()
  }, [orderId])

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {loading ? (
          <>
            <div className="w-16 h-16 border-4 border-[#E8889A] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-[#7C4A2D] font-medium">Confirmando tu pago...</p>
          </>
        ) : status === 'approved' ? (
          <>
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
              🎉
            </div>
            <h1 className="text-2xl font-bold text-[#3D1A0E] mb-2">¡Seña confirmada!</h1>
            <p className="text-[#7C4A2D] mb-2">
              Tu pago fue aprobado. El pedido <strong className="text-[#3D1A0E]">#{orderId}</strong> ya está en producción.
            </p>
            <p className="text-sm text-[#A0673A] mb-8">
              Te avisamos por WhatsApp cuando esté listo para retirar o entregarte.
            </p>
            <div className="bg-[#F5E8D0] rounded-2xl p-5 mb-6 text-left">
              <p className="font-semibold text-[#3D1A0E] text-sm mb-2">¿Qué sigue?</p>
              <ol className="space-y-1.5 text-sm text-[#7C4A2D]">
                <li className="flex gap-2"><span className="text-[#E8889A] font-bold">1.</span> Confirmamos tu pedido por WhatsApp.</li>
                <li className="flex gap-2"><span className="text-[#E8889A] font-bold">2.</span> Lo preparamos con amor y cariño. 🍪</li>
                <li className="flex gap-2"><span className="text-[#E8889A] font-bold">3.</span> Te avisamos cuando esté listo.</li>
              </ol>
            </div>
            <Link to="/" className="block w-full bg-[#E8889A] hover:bg-[#d9768a] text-white font-bold py-3.5 rounded-full text-center transition-colors">
              Volver al inicio
            </Link>
            <p className="text-xs text-[#C4A882] mt-4">🐱 Gracias por tu pedido. Ayudaste a un gatito hoy.</p>
          </>
        ) : (
          <>
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
              ⏳
            </div>
            <h1 className="text-2xl font-bold text-[#3D1A0E] mb-2">Pago en proceso</h1>
            <p className="text-[#7C4A2D] mb-8">
              Tu pago está siendo procesado. Cuando se confirme, tu pedido <strong>#{orderId}</strong> pasará a producción automáticamente.
            </p>
            <a
              href={`https://wa.me/5491100000000?text=Hola! Hice el pedido %23${orderId} y el pago quedó pendiente`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-full text-center transition-colors mb-3"
            >
              💬 Consultar por WhatsApp
            </a>
            <Link to="/" className="block w-full border-2 border-[#D4A76A] text-[#7C4A2D] font-semibold py-3.5 rounded-full text-center hover:bg-[#F5E8D0] transition-colors">
              Volver al inicio
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

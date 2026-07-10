import { useSearchParams, Link } from 'react-router-dom'

export default function PaymentPending() {
  const [params] = useSearchParams()
  const orderId = params.get('order_id')

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
          ⏳
        </div>
        <h1 className="text-2xl font-bold text-[#3D1A0E] mb-2">Pago pendiente de acreditación</h1>
        <p className="text-[#7C4A2D] mb-2">
          Tu pago para el pedido {orderId ? <strong className="text-[#3D1A0E]">#{orderId}</strong> : ''} está
          en proceso de acreditación.
        </p>
        <p className="text-sm text-[#A0673A] mb-8">
          Esto puede demorar algunas horas dependiendo del medio de pago. Cuando se acredite,
          tu pedido pasará automáticamente a producción.
        </p>

        <div className="bg-[#F5E8D0] rounded-2xl p-5 mb-6 text-left">
          <p className="font-semibold text-[#3D1A0E] text-sm mb-2">¿Qué hacer?</p>
          <ul className="space-y-1.5 text-sm text-[#7C4A2D]">
            <li className="flex gap-2"><span className="text-[#E8889A]">•</span> No volvás a pagar — el pedido ya existe.</li>
            <li className="flex gap-2"><span className="text-[#E8889A]">•</span> Si pagaste con transferencia bancaria, puede demorar hasta 72hs.</li>
            <li className="flex gap-2"><span className="text-[#E8889A]">•</span> Ante cualquier duda, escribinos por WhatsApp.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={`https://wa.me/5491100000000?text=Hola! El pago del pedido %23${orderId} quedó pendiente`}
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

        <p className="text-xs text-[#C4A882] mt-6">🐱 Gracias por tu pedido. Ayudaste a un gatito hoy.</p>
      </div>
    </div>
  )
}

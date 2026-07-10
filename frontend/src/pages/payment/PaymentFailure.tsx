import { useSearchParams, Link } from 'react-router-dom'

export default function PaymentFailure() {
  const [params] = useSearchParams()
  const orderId = params.get('order_id')

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
          😔
        </div>
        <h1 className="text-2xl font-bold text-[#3D1A0E] mb-2">El pago no se completó</h1>
        <p className="text-[#7C4A2D] mb-2">
          Tu pedido {orderId ? <strong className="text-[#3D1A0E]">#{orderId}</strong> : ''} está guardado,
          pero la seña no fue procesada.
        </p>
        <p className="text-sm text-[#A0673A] mb-8">
          Podés intentarlo de nuevo o contactarnos por WhatsApp para coordinar otro método de pago.
        </p>

        <div className="flex flex-col gap-3">
          {orderId && (
            <Link
              to={`/pedido/${orderId}`}
              className="w-full bg-[#E8889A] hover:bg-[#d9768a] text-white font-bold py-3.5 rounded-full text-center transition-colors"
            >
              Volver al pedido e intentar de nuevo
            </Link>
          )}
          <a
            href={`https://wa.me/5491100000000?text=Hola! Intente pagar el pedido %23${orderId} y no me funcionó`}
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
      </div>
    </div>
  )
}

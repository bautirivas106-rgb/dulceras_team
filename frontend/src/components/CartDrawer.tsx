import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, total, itemCount, removeItem, setQty } = useCart()
  const navigate = useNavigate()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative bg-[#FDF6EC] w-full max-w-sm h-full shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5E8D0]">
          <h2 className="font-bold text-[#3D1A0E] text-lg">
            Tu pedido {itemCount > 0 && <span className="text-[#E8889A]">({itemCount})</span>}
          </h2>
          <button
            onClick={onClose}
            className="text-[#A0673A] hover:text-[#3D1A0E] transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-[#A0673A]">
              <div className="text-5xl mb-3">🛒</div>
              <p className="font-medium">Tu carrito está vacío</p>
              <p className="text-sm mt-1">Agregá algo rico del catálogo</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="bg-white rounded-xl border border-[#F5E8D0] p-3 flex gap-3"
                >
                  <div className="w-10 h-10 bg-[#F5E8D0] rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                    🍰
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#3D1A0E] text-sm truncate">{item.productName}</p>
                    <p className="text-[#A0673A] text-xs">{item.variantName}</p>
                    <p className="text-[#E8889A] font-bold text-sm mt-0.5">
                      ${(item.price * item.quantity).toLocaleString('es-AR')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-[#D4A76A] hover:text-[#E8889A] text-xs transition-colors"
                    >
                      ✕
                    </button>
                    <div className="flex items-center gap-1 bg-[#F5E8D0] rounded-lg px-1">
                      <button
                        onClick={() => setQty(item.variantId, item.quantity - 1)}
                        className="w-6 h-6 text-[#7C4A2D] font-bold text-base hover:text-[#3D1A0E]"
                      >
                        −
                      </button>
                      <span className="w-4 text-center text-sm font-semibold text-[#3D1A0E]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => setQty(item.variantId, item.quantity + 1)}
                        className="w-6 h-6 text-[#7C4A2D] font-bold text-base hover:text-[#3D1A0E]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-[#F5E8D0] bg-[#FDF6EC]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#7C4A2D] font-medium">Total estimado</span>
              <span className="text-[#3D1A0E] font-bold text-xl">
                ${total.toLocaleString('es-AR')}
              </span>
            </div>
            <button
              onClick={() => { onClose(); navigate('/checkout') }}
              className="w-full bg-[#E8889A] hover:bg-[#d9768a] text-white font-bold py-3.5 rounded-full transition-colors shadow-md"
            >
              Ir al checkout →
            </button>
            <p className="text-center text-xs text-[#A0673A] mt-2">
              + costo de delivery si corresponde
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

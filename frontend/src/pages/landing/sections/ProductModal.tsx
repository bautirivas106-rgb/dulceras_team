import { useState, useEffect } from 'react'
import type { Product, ProductVariant } from '../../../types/catalog'
import { useCart } from '../../../context/CartContext'

interface Props {
  product: Product
  onClose: () => void
}

export default function ProductModal({ product, onClose }: Props) {
  // Public API only returns active variants; is_active may be undefined — treat absent as true
  const activeVariants = product.variants.filter((v) => v.is_active !== false)
  const [selected, setSelected] = useState<ProductVariant | null>(activeVariants[0] ?? null)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function handleAdd() {
    if (!selected) return
    addItem({
      variantId: selected.id,
      productId: product.id,
      productName: product.name,
      variantName: selected.name,
      price: Number(selected.price),
      requiresAdvanceHours: product.requires_advance_hours,
    })
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      onClose()
    }, 800)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative bg-[#FDF6EC] w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen */}
        <div className="bg-[#F5E8D0] h-48 sm:h-56 flex items-center justify-center flex-shrink-0">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-7xl opacity-60">🍰</span>
          )}
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="flex gap-2 flex-wrap mb-3">
            {product.requires_advance_hours > 0 && (
              <span className="text-xs bg-[#F7D0D8] text-[#7C4A2D] px-3 py-1 rounded-full font-medium">
                ⏰ {product.requires_advance_hours}h anticipación
              </span>
            )}
            <span className="text-xs bg-[#F5E8D0] text-[#A0673A] px-3 py-1 rounded-full font-medium">
              🐱 Ayuda a gatitos
            </span>
          </div>

          <h2 className="text-2xl font-bold text-[#3D1A0E] mb-2">{product.name}</h2>
          <p className="text-[#7C4A2D] text-sm leading-relaxed mb-5">{product.description}</p>

          {activeVariants.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-[#A0673A] uppercase tracking-wide mb-3">
                Elegí tu tamaño
              </p>
              <div className="flex flex-col gap-2">
                {activeVariants.map((v) => (
                  <label
                    key={v.id}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selected?.id === v.id
                        ? 'border-[#E8889A] bg-[#FFF0F3]'
                        : 'border-[#F5E8D0] bg-white hover:border-[#D4A76A]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="variant"
                        checked={selected?.id === v.id}
                        onChange={() => setSelected(v)}
                        className="accent-[#E8889A]"
                      />
                      <span className="text-sm font-medium text-[#3D1A0E]">{v.name}</span>
                    </div>
                    <span className="text-sm font-bold text-[#E8889A]">
                      ${Number(v.price).toLocaleString('es-AR')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F5E8D0] bg-[#FDF6EC] flex-shrink-0">
          {selected && (
            <p className="text-center text-xs text-[#A0673A] mb-3">
              Seleccionado:{' '}
              <strong className="text-[#3D1A0E]">
                {selected.name} — ${Number(selected.price).toLocaleString('es-AR')}
              </strong>
            </p>
          )}
          <button
            className={`w-full font-bold py-3.5 rounded-full transition-all text-base shadow-md ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-[#E8889A] hover:bg-[#d9768a] text-white'
            }`}
            onClick={handleAdd}
            disabled={!selected || added}
          >
            {added ? '¡Agregado! ✓' : 'Agregar al pedido 🛒'}
          </button>
          <button
            onClick={onClose}
            className="w-full mt-2 text-[#A0673A] text-sm py-2 hover:text-[#7C4A2D] transition-colors"
          >
            Seguir viendo
          </button>
        </div>
      </div>
    </div>
  )
}

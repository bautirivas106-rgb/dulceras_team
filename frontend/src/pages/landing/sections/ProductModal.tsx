import { useState, useEffect } from 'react'
import type { Product, ProductVariant } from '../../../types/catalog'
import { useCart } from '../../../context/CartContext'

interface Props {
  product: Product
  onClose: () => void
}

function isVariantAvailable(v: ProductVariant, madeToOrder: boolean) {
  if (v.is_active === false) return false
  if (!madeToOrder && v.stock_quantity === 0) return false
  return true
}

export default function ProductModal({ product, onClose }: Props) {
  const activeVariants = product.variants.filter((v) => v.is_active !== false)
  const firstAvailable = activeVariants.find((v) => isVariantAvailable(v, product.made_to_order)) ?? activeVariants[0] ?? null
  const [selected, setSelected] = useState<ProductVariant | null>(firstAvailable)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()
  const selectedAvailable = selected ? isVariantAvailable(selected, product.made_to_order) : false

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
    setTimeout(() => { setAdded(false); onClose() }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative bg-cream w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-cream-dark h-48 sm:h-56 flex items-center justify-center flex-shrink-0">
          {product.image_url
            ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            : <span className="text-7xl opacity-60">🍰</span>
          }
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div className="flex gap-2 flex-wrap mb-3">
            {product.requires_advance_hours > 0 && (
              <span className="text-xs bg-rose-light text-mocha px-3 py-1 rounded-full font-medium">
                ⏰ {product.requires_advance_hours}h anticipación
              </span>
            )}
            <span className="text-xs bg-cream-dark text-mocha-light px-3 py-1 rounded-full font-medium">
              🐱 Ayuda a gatitos
            </span>
          </div>

          <h2 className="text-2xl font-bold text-chocolate mb-2">{product.name}</h2>
          <p className="text-mocha text-sm leading-relaxed mb-5">{product.description}</p>

          {activeVariants.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-mocha-light uppercase tracking-wide mb-3">Elegí tu tamaño</p>
              <div className="flex flex-col gap-2">
                {activeVariants.map((v) => {
                  const available = isVariantAvailable(v, product.made_to_order)
                  const lowStock = !product.made_to_order && v.stock_quantity > 0 && v.stock_quantity <= 3
                  return (
                    <label
                      key={v.id}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                        !available
                          ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                          : selected?.id === v.id
                          ? 'border-rose bg-rose-light/30 cursor-pointer'
                          : 'border-cream-dark bg-white hover:border-caramel cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="variant"
                          checked={selected?.id === v.id}
                          onChange={() => available && setSelected(v)}
                          disabled={!available}
                          className="accent-rose"
                        />
                        <div>
                          <span className={`text-sm font-medium ${available ? 'text-chocolate' : 'text-gray-400 line-through'}`}>
                            {v.name}
                          </span>
                          {!available && <span className="ml-2 text-[10px] text-gray-400">Agotado</span>}
                          {lowStock && <span className="ml-2 text-[10px] text-amber-600 font-semibold">¡Últimas {v.stock_quantity}!</span>}
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${available ? 'text-rose' : 'text-gray-300'}`}>
                        ${Number(v.price).toLocaleString('es-AR')}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-cream-dark bg-cream flex-shrink-0">
          {selected && (
            <p className="text-center text-xs text-mocha-light mb-3">
              Seleccionado:{' '}
              <strong className="text-chocolate">
                {selected.name} — ${Number(selected.price).toLocaleString('es-AR')}
              </strong>
            </p>
          )}
          <button
            className={`w-full font-bold py-3.5 rounded-full transition-all text-base shadow-md ${
              added
                ? 'bg-green-500 text-white'
                : !selectedAvailable
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-rose hover:opacity-90 text-white'
            }`}
            onClick={handleAdd}
            disabled={!selected || added || !selectedAvailable}
          >
            {added ? '¡Agregado! ✓' : !selectedAvailable ? 'Sin stock' : 'Agregar al pedido 🛒'}
          </button>
          <button onClick={onClose} className="w-full mt-2 text-mocha-light text-sm py-2 hover:text-mocha transition-colors">
            Seguir viendo
          </button>
        </div>
      </div>
    </div>
  )
}

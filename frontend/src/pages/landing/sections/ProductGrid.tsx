import { useState } from 'react'
import type { Product } from '../../../types/catalog'
import ProductModal from './ProductModal'

interface Props {
  products: Product[]
  loading: boolean
}

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const activeVariants = product.variants.filter((v) => v.is_active !== false)
  const minPrice = activeVariants.length
    ? Math.min(...activeVariants.map((v) => Number(v.price)))
    : null

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-[#F5E8D0] transition-all hover:-translate-y-0.5 text-left group"
    >
      {/* Imagen */}
      <div className="bg-[#F5E8D0] h-44 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-5xl opacity-50">🍰</span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-[#3D1A0E] text-sm leading-snug mb-1">
          {product.name}
        </h3>
        <p className="text-[#A0673A] text-xs line-clamp-2 leading-relaxed mb-3">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          {minPrice !== null && (
            <span className="text-[#E8889A] font-bold text-base">
              desde ${minPrice.toLocaleString('es-AR')}
            </span>
          )}
          {product.requires_advance_hours > 0 && (
            <span className="text-[10px] bg-[#F7D0D8] text-[#7C4A2D] px-2 py-0.5 rounded-full">
              ⏰ {product.requires_advance_hours}h
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#F5E8D0] animate-pulse">
      <div className="bg-[#F5E8D0] h-44" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-[#F5E8D0] rounded w-3/4" />
        <div className="h-3 bg-[#F5E8D0] rounded w-full" />
        <div className="h-3 bg-[#F5E8D0] rounded w-2/3" />
        <div className="h-5 bg-[#F5E8D0] rounded w-1/2 mt-3" />
      </div>
    </div>
  )
}

export default function ProductGrid({ products, loading }: Props) {
  const [selected, setSelected] = useState<Product | null>(null)

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-[#A0673A]">
        <div className="text-5xl mb-4">🍰</div>
        <p className="text-lg font-medium">No hay productos en esta categoría todavía.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onClick={() => setSelected(p)} />
        ))}
      </div>

      {selected && (
        <ProductModal product={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}

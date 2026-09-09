import { useState } from 'react'
import { Clock } from 'lucide-react'
import type { Product } from '../../../types/catalog'
import ProductModal from './ProductModal'

interface Props {
  products: Product[]
  loading: boolean
}

function variantAvailable(v: { stock_quantity: number; is_active?: boolean }, madeToOrder: boolean) {
  if (v.is_active === false) return false
  if (!madeToOrder && v.stock_quantity === 0) return false
  return true
}

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const activeVariants    = product.variants.filter((v) => v.is_active !== false)
  const availableVariants = activeVariants.filter((v) => variantAvailable(v, product.made_to_order))
  const outOfStock        = !product.made_to_order && availableVariants.length === 0
  const minPrice          = availableVariants.length
    ? Math.min(...availableVariants.map((v) => Number(v.price)))
    : activeVariants.length
      ? Math.min(...activeVariants.map((v) => Number(v.price)))
      : null

  return (
    <button
      onClick={outOfStock ? undefined : onClick}
      disabled={outOfStock}
      className="bg-white rounded-2xl overflow-hidden text-left group relative"
      style={{
        border: 'none', cursor: outOfStock ? 'not-allowed' : 'pointer',
        opacity: outOfStock ? 0.6 : 1,
        boxShadow: '0 8px 24px rgba(58,36,23,0.08)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={e => {
        if (!outOfStock) {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 16px 36px rgba(58,36,23,0.13)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(58,36,23,0.08)'
      }}
    >
      {outOfStock && (
        <div
          className="absolute top-2 left-2 z-10 text-white font-bold rounded-full"
          style={{ background: 'rgba(58,36,23,0.7)', fontSize: 10, padding: '3px 10px' }}
        >
          Agotado
        </div>
      )}

      {/* Image */}
      <div
        className="overflow-hidden"
        style={{ height: 180, background: '#F6EAD6' }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${!outOfStock ? 'group-hover:scale-105' : 'grayscale'}`}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #EFE2CB, #F0A0C4)' }}
          />
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px 20px' }}>
        <h3
          className="font-fraunces font-semibold text-brown"
          style={{ fontSize: '1rem', lineHeight: 1.3, marginBottom: 6 }}
        >
          {product.name}
        </h3>
        <p
          className="text-brown-soft"
          style={{ fontSize: '0.82rem', lineHeight: 1.5, marginBottom: 12,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {product.description}
        </p>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {minPrice !== null && (
            <span
              className="font-bold"
              style={{ fontSize: '1rem', color: outOfStock ? '#9CA3AF' : '#E285AF' }}
            >
              desde ${minPrice.toLocaleString('es-AR')}
            </span>
          )}
          {product.requires_advance_hours > 0 && !outOfStock && (
            <span
              className="inline-flex items-center gap-1 rounded-full"
              style={{ background: '#F6EAD6', color: '#5A3B29', fontSize: 10, padding: '3px 9px' }}
            >
              <Clock size={10} />
              {product.requires_advance_hours}h
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse" style={{ boxShadow: '0 8px 24px rgba(58,36,23,0.06)' }}>
      <div style={{ height: 180, background: '#F6EAD6' }} />
      <div style={{ padding: '16px 18px 20px' }} className="space-y-2.5">
        <div className="h-4 rounded-lg w-3/4" style={{ background: '#EFE2CB' }} />
        <div className="h-3 rounded-lg w-full" style={{ background: '#EFE2CB' }} />
        <div className="h-3 rounded-lg w-2/3" style={{ background: '#EFE2CB' }} />
        <div className="h-5 rounded-lg w-1/2 mt-3" style={{ background: '#EFE2CB' }} />
      </div>
    </div>
  )
}

export default function ProductGrid({ products, loading }: Props) {
  const [selected, setSelected] = useState<Product | null>(null)

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div
          className="inline-flex items-center justify-center rounded-full mb-4"
          style={{ width: 72, height: 72, background: '#F6EAD6' }}
        >
          <span style={{ fontSize: 32 }}>🍰</span>
        </div>
        <p className="font-fraunces font-semibold text-brown" style={{ fontSize: '1.1rem' }}>
          No hay productos en esta categoría todavía.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onClick={() => setSelected(p)} />
        ))}
      </div>
      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

import { useRef, useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getProducts } from '../../api/catalog'
import type { Product } from '../../types/catalog'

const TENANT = 'dulceras-team'
const CARD_W = 300
const GAP = 20

const GRADIENTS = [
  'linear-gradient(135deg, #EFE2CB 0%, #F0A0C4 100%)',
  'linear-gradient(135deg, #F4BDE0 0%, #E285AF 100%)',
  'linear-gradient(135deg, #F6EAD6 0%, #EFE2CB 100%)',
  'linear-gradient(135deg, #F0A0C4 0%, #F6EAD6 100%)',
  'linear-gradient(135deg, #EFE2CB 0%, #F4BDE0 100%)',
  'linear-gradient(135deg, #E285AF 0%, #EFE2CB 100%)',
]

function minPrice(product: Product): number | null {
  const prices = product.variants
    .filter((v) => v.is_active !== false)
    .map((v) => Number(v.price))
  return prices.length ? Math.min(...prices) : null
}

function SkeletonCard() {
  return (
    <div
      className="flex-none bg-white rounded-[20px] overflow-hidden animate-pulse"
      style={{ width: CARD_W, scrollSnapAlign: 'start', boxShadow: '0 10px 30px rgba(58,36,23,0.06)' }}
    >
      <div style={{ height: 200, background: '#F6EAD6' }} />
      <div style={{ padding: '18px 20px 22px' }} className="space-y-2.5">
        <div className="h-4 rounded-lg w-3/4" style={{ background: '#EFE2CB' }} />
        <div className="h-3 rounded-lg w-full" style={{ background: '#EFE2CB' }} />
        <div className="h-3 rounded-lg w-2/3" style={{ background: '#EFE2CB' }} />
        <div className="h-5 rounded-lg w-1/2 mt-2" style={{ background: '#EFE2CB' }} />
      </div>
    </div>
  )
}

export default function CatalogCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts(TENANT)
      .then((data) => setProducts(data.slice(0, 10)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const total = products.length

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.scrollTo({ left: active * (CARD_W + GAP), behavior: 'smooth' })
  }, [active])

  useEffect(() => {
    const el = trackRef.current
    if (!el || total === 0) return
    const onScroll = () => {
      const idx = Math.min(Math.round(el.scrollLeft / (CARD_W + GAP)), total - 1)
      setActive(idx)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [total])

  useEffect(() => {
    if (hovered || total === 0) return
    const timer = setInterval(() => setActive(i => (i + 1) % total), 4500)
    return () => clearInterval(timer)
  }, [hovered, total])

  return (
    <section id="catalogo" className="py-20" style={{ background: '#FDF6EC' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <p
          className="text-center font-semibold text-pink-deep"
          style={{ fontSize: '0.82rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}
        >
          Lo que hacemos
        </p>
        <h2
          className="text-center font-fraunces font-bold text-brown"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: 48 }}
        >
          Nuestro catálogo
        </h2>

        {/* Carousel track */}
        <div
          ref={trackRef}
          className="flex pb-5"
          style={{
            gap: GAP,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((p, i) => {
                const price = minPrice(p)
                const bg = GRADIENTS[i % GRADIENTS.length]
                return (
                  <Link
                    key={p.id}
                    to="/catalogo"
                    className="flex-none bg-white rounded-[20px] overflow-hidden no-underline"
                    style={{
                      width: CARD_W,
                      scrollSnapAlign: 'start',
                      boxShadow: '0 10px 30px rgba(58,36,23,0.08)',
                      transition: 'transform 0.35s ease, box-shadow 0.35s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-6px)'
                      e.currentTarget.style.boxShadow = '0 18px 40px rgba(58,36,23,0.14)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = ''
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(58,36,23,0.08)'
                    }}
                  >
                    {/* Image / placeholder */}
                    <div style={{ height: 200, background: bg, overflow: 'hidden' }}>
                      {p.image_url && (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </div>

                    {/* Body */}
                    <div style={{ padding: '18px 20px 22px' }}>
                      <p
                        className="font-semibold text-pink-deep"
                        style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}
                      >
                        {typeof p.category === 'object' ? p.category.name : ''}
                      </p>
                      <h3
                        className="font-fraunces font-semibold text-brown"
                        style={{ fontSize: '1.05rem', lineHeight: 1.25, marginBottom: 6 }}
                      >
                        {p.name}
                      </h3>
                      {p.description && (
                        <p
                          className="text-brown-soft"
                          style={{
                            fontSize: '0.83rem', lineHeight: 1.5, marginBottom: 10,
                            display: '-webkit-box', WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}
                        >
                          {p.description}
                        </p>
                      )}
                      {price !== null && (
                        <p className="font-bold text-pink-deep" style={{ fontSize: '1rem' }}>
                          desde ${price.toLocaleString('es-AR')}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
        </div>

        {/* Controls */}
        {!loading && total > 0 && (
          <div className="flex justify-center items-center gap-5 mt-2">
            <button
              onClick={() => setActive(i => Math.max(0, i - 1))}
              className="flex items-center justify-center text-brown-soft"
              style={{
                width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                background: '#FDF6EC', border: '1.5px solid rgba(58,36,23,0.18)',
                cursor: 'pointer', transition: 'background 0.2s ease',
              }}
              aria-label="Anterior"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex gap-2">
              {products.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  style={{
                    height: 8,
                    width: active === i ? 22 : 8,
                    borderRadius: active === i ? 5 : '50%',
                    background: active === i ? '#E285AF' : '#EFE2CB',
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'background 0.2s, width 0.2s',
                  }}
                  aria-label={`Ir a ${products[i].name}`}
                />
              ))}
            </div>

            <button
              onClick={() => setActive(i => Math.min(total - 1, i + 1))}
              className="flex items-center justify-center text-brown-soft"
              style={{
                width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                background: '#FDF6EC', border: '1.5px solid rgba(58,36,23,0.18)',
                cursor: 'pointer', transition: 'background 0.2s ease',
              }}
              aria-label="Siguiente"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-center mt-10">
          <Link
            to="/catalogo"
            className="inline-block text-sm font-semibold text-white rounded-full px-8 py-3"
            style={{
              background: 'linear-gradient(135deg, #F0A0C4, #E285AF)',
              boxShadow: '0 6px 18px rgba(226,133,175,0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 10px 24px rgba(226,133,175,0.55)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(226,133,175,0.4)'
            }}
          >
            Ver catálogo completo →
          </Link>
        </div>
      </div>
    </section>
  )
}

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useCatalog'
import type { Product } from '../../types/catalog'

const TENANT = 'dulceras-team'
const CARD_W = 300
const GAP = 20
const VISIBLE = 3   // cards shown at once on desktop

const GRADIENTS = [
  'linear-gradient(135deg, #EFE2CB 0%, #F0A0C4 100%)',
  'linear-gradient(135deg, #F4BDE0 0%, #E285AF 100%)',
  'linear-gradient(135deg, #F6EAD6 0%, #EFE2CB 100%)',
  'linear-gradient(135deg, #F0A0C4 0%, #F6EAD6 100%)',
  'linear-gradient(135deg, #EFE2CB 0%, #F4BDE0 100%)',
  'linear-gradient(135deg, #E285AF 0%, #EFE2CB 100%)',
]

function getCategoryName(p: Product): string {
  if (p.category !== null && p.category !== undefined && typeof p.category === 'object') {
    return (p.category as { name: string }).name
  }
  return ''
}

function getMinPrice(p: Product): number | null {
  if (!p.variants || p.variants.length === 0) return null
  const prices = p.variants.map(v => Number(v.price)).filter(n => !isNaN(n) && n > 0)
  return prices.length ? Math.min(...prices) : null
}

function SkeletonCard() {
  return (
    <div style={{
      flexShrink: 0, width: CARD_W, borderRadius: 20, overflow: 'hidden',
      background: '#fff', boxShadow: '0 10px 30px rgba(58,36,23,0.06)',
    }}>
      <div style={{ height: 200, background: '#F6EAD6' }} />
      <div style={{ padding: '18px 20px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ height: 10, borderRadius: 6, width: '40%', background: '#EFE2CB' }} />
        <div style={{ height: 16, borderRadius: 6, width: '80%', background: '#EFE2CB' }} />
        <div style={{ height: 12, borderRadius: 6, width: '100%', background: '#EFE2CB' }} />
        <div style={{ height: 12, borderRadius: 6, width: '60%', background: '#EFE2CB' }} />
        <div style={{ height: 18, borderRadius: 6, width: '45%', background: '#EFE2CB', marginTop: 4 }} />
      </div>
    </div>
  )
}

export default function CatalogCarousel() {
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState(false)

  const { products: all, loading } = useProducts(TENANT)
  const products = all.slice(0, 9)
  const total = products.length

  const maxIndex = Math.max(0, total - VISIBLE)

  function prev() { setActive(i => Math.max(0, i - 1)) }
  function next() { setActive(i => Math.min(maxIndex, i + 1)) }

  // Autoplay
  useEffect(() => {
    if (hovered || total === 0) return
    const id = setInterval(() => {
      setActive(i => (i >= maxIndex ? 0 : i + 1))
    }, 4000)
    return () => clearInterval(id)
  }, [hovered, total, maxIndex])

  const offset = active * (CARD_W + GAP)

  return (
    <section
      id="catalogo"
      style={{ padding: '80px 0', background: '#FDF6EC' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px' }}>

        {/* Heading */}
        <p style={{
          textAlign: 'center', fontSize: '0.82rem', fontWeight: 600,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          color: '#E285AF', marginBottom: 8, marginTop: 0,
          fontFamily: 'Poppins, sans-serif',
        }}>
          Lo que hacemos
        </p>
        <h2 style={{
          textAlign: 'center', fontFamily: 'Fraunces, Georgia, serif',
          fontWeight: 700, color: '#3A2417', marginTop: 0, marginBottom: 48,
          fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
        }}>
          Nuestro catálogo
        </h2>

        {/* Viewport (clips the sliding track) */}
        <div style={{ overflow: 'hidden', width: '100%' }}>
          {/* Sliding track */}
          <div
            style={{
              display: 'flex',
              gap: GAP,
              transform: `translateX(-${offset}px)`,
              transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              paddingBottom: 8,
            }}
          >
            {loading
              ? Array.from({ length: VISIBLE + 1 }, (_, i) => <SkeletonCard key={i} />)
              : products.map((p, i) => {
                  const price = getMinPrice(p)
                  const catName = getCategoryName(p)
                  const bg = GRADIENTS[i % GRADIENTS.length]
                  return (
                    <Link
                      key={p.id}
                      to="/catalogo"
                      style={{
                        display: 'block',
                        flexShrink: 0,
                        width: CARD_W,
                        borderRadius: 20,
                        overflow: 'hidden',
                        textDecoration: 'none',
                        background: '#fff',
                        boxShadow: '0 10px 30px rgba(58,36,23,0.08)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-6px)'
                        e.currentTarget.style.boxShadow = '0 18px 40px rgba(58,36,23,0.14)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(58,36,23,0.08)'
                      }}
                    >
                      {/* Image area */}
                      <div style={{ height: 200, background: bg, overflow: 'hidden' }}>
                        {p.image_url && (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        )}
                      </div>
                      {/* Card body */}
                      <div style={{ padding: '18px 20px 22px' }}>
                        {catName && (
                          <p style={{
                            fontSize: '0.72rem', fontWeight: 600,
                            letterSpacing: '0.05em', textTransform: 'uppercase',
                            color: '#E285AF', marginTop: 0, marginBottom: 4,
                            fontFamily: 'Poppins, sans-serif',
                          }}>
                            {catName}
                          </p>
                        )}
                        <h3 style={{
                          fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.25,
                          color: '#3A2417', marginTop: 0, marginBottom: 6,
                          fontFamily: 'Fraunces, Georgia, serif',
                        }}>
                          {p.name}
                        </h3>
                        {p.description && (
                          <p style={{
                            fontSize: '0.83rem', lineHeight: 1.5, color: '#5A3B29',
                            marginTop: 0, marginBottom: price !== null ? 10 : 0,
                            fontFamily: 'Poppins, sans-serif',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical' as const,
                          }}>
                            {p.description}
                          </p>
                        )}
                        {price !== null && (
                          <p style={{
                            fontSize: '1rem', fontWeight: 700,
                            color: '#E285AF', margin: 0,
                            fontFamily: 'Poppins, sans-serif',
                          }}>
                            desde ${price.toLocaleString('es-AR')}
                          </p>
                        )}
                      </div>
                    </Link>
                  )
                })
            }
          </div>
        </div>

        {/* Controls */}
        {!loading && total > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginTop: 24 }}>
            <button
              onClick={prev}
              disabled={active === 0}
              aria-label="Anterior"
              style={{
                width: 42, height: 42, borderRadius: '50%',
                background: '#FDF6EC', border: '1.5px solid rgba(58,36,23,0.18)',
                cursor: active === 0 ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#5A3B29', opacity: active === 0 ? 0.4 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <ArrowLeft size={18} />
            </button>

            <div style={{ display: 'flex', gap: 8 }}>
              {Array.from({ length: maxIndex + 1 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Posición ${i + 1}`}
                  style={{
                    height: 8,
                    width: active === i ? 22 : 8,
                    borderRadius: active === i ? 4 : '50%',
                    background: active === i ? '#E285AF' : '#EFE2CB',
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'width 0.25s ease, background 0.2s ease',
                  }}
                />
              ))}
            </div>

            <button
              onClick={next}
              disabled={active >= maxIndex}
              aria-label="Siguiente"
              style={{
                width: 42, height: 42, borderRadius: '50%',
                background: '#FDF6EC', border: '1.5px solid rgba(58,36,23,0.18)',
                cursor: active >= maxIndex ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#5A3B29', opacity: active >= maxIndex ? 0.4 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* CTA */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
          <Link
            to="/catalogo"
            style={{
              display: 'inline-block', fontSize: '0.875rem', fontWeight: 600,
              color: '#fff', textDecoration: 'none', padding: '12px 32px',
              borderRadius: 100, fontFamily: 'Poppins, sans-serif',
              background: 'linear-gradient(135deg, #F0A0C4, #E285AF)',
              boxShadow: '0 6px 18px rgba(226,133,175,0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 10px 24px rgba(226,133,175,0.55)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
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

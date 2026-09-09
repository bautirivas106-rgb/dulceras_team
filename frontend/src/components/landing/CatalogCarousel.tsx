import { useRef, useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const PRODUCTS = [
  {
    id: 1,
    name: 'Cookies de chocolate',
    desc: 'Caja x6, grandes y fudgy por dentro, crujientes por fuera.',
    price: '$3.500',
    bg: 'linear-gradient(135deg, #EFE2CB 0%, #F0A0C4 100%)',
  },
  {
    id: 2,
    name: 'Torta de cumpleaños',
    desc: 'Chocolate triple, rellena de ganache y crema. Personalizable.',
    price: '$12.000',
    bg: 'linear-gradient(135deg, #F4BDE0 0%, #E285AF 100%)',
  },
  {
    id: 3,
    name: 'Brownies fudgy',
    desc: 'Caja x4, densos y húmedos con nueces opcionales.',
    price: '$4.200',
    bg: 'linear-gradient(135deg, #F6EAD6 0%, #EFE2CB 100%)',
  },
  {
    id: 4,
    name: 'Tiramisú artesanal',
    desc: 'Porción individual con mascarpone importado y café intenso.',
    price: '$3.800',
    bg: 'linear-gradient(135deg, #F0A0C4 0%, #F6EAD6 100%)',
  },
  {
    id: 5,
    name: 'Cheesecake dulce de leche',
    desc: 'Base de galletita, sin horno, relleno cremoso y suave.',
    price: '$3.600',
    bg: 'linear-gradient(135deg, #EFE2CB 0%, #F0A0C4 100%)',
  },
]

const CARD_W = 340
const GAP = 24

export default function CatalogCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState(false)
  const total = PRODUCTS.length

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.scrollTo({ left: active * (CARD_W + GAP), behavior: 'smooth' })
  }, [active])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const onScroll = () => {
      const idx = Math.min(Math.round(el.scrollLeft / (CARD_W + GAP)), total - 1)
      setActive(idx)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [total])

  useEffect(() => {
    if (hovered) return
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
            gap: GAP, overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {PRODUCTS.map((p) => (
            <div
              key={p.id}
              className="flex-none bg-white rounded-[20px] overflow-hidden"
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
              {/* Image area */}
              <div style={{ height: 230, background: p.bg }} />
              {/* Body */}
              <div style={{ padding: '20px 22px 24px' }}>
                <h3
                  className="font-fraunces font-semibold text-brown"
                  style={{ fontSize: '1.15rem', marginBottom: 6 }}
                >
                  {p.name}
                </h3>
                <p className="text-brown-soft" style={{ fontSize: '0.88rem', lineHeight: 1.5, marginBottom: 12 }}>
                  {p.desc}
                </p>
                <p className="font-semibold text-pink-deep" style={{ fontSize: '1rem' }}>{p.price}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-5 mt-2">
          <button
            onClick={() => setActive(i => Math.max(0, i - 1))}
            className="btn-animated-border flex items-center justify-center text-brown-soft"
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
            {PRODUCTS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  height: 8,
                  width: active === i ? 22 : 8,
                  borderRadius: active === i ? 5 : '50%',
                  background: active === i ? '#E285AF' : '#EFE2CB',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'background 0.2s ease, width 0.2s ease',
                }}
                aria-label={`Ir a ${PRODUCTS[i].name}`}
              />
            ))}
          </div>

          <button
            onClick={() => setActive(i => Math.min(total - 1, i + 1))}
            className="btn-animated-border flex items-center justify-center text-brown-soft"
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
      </div>
    </section>
  )
}

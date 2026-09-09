import { Link } from 'react-router-dom'
import { Cat, Cookie, Clock, Package, CreditCard } from 'lucide-react'

export default function HeroSection() {
  return (
    <section id="inicio" className="relative overflow-hidden" style={{ background: '#FDF6EC' }}>
      {/* Aurora background */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `
            repeating-linear-gradient(100deg, #FDF6EC 0%, #FDF6EC 7%, transparent 10%, transparent 12%, #FDF6EC 16%),
            repeating-linear-gradient(100deg, #F0A0C4 10%, #E285AF 15%, #EFE2CB 20%, #F7C4DD 25%, #F0A0C4 30%)
          `,
          backgroundSize: '300% 200%, 200% 100%',
          backgroundPosition: '50% 50%, 50% 50%',
          filter: 'blur(32px)',
          opacity: 0.35,
          animation: 'aurora-move 60s linear infinite',
          maskImage: 'radial-gradient(ellipse at 50% 0%, black 10%, transparent 65%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, black 10%, transparent 65%)',
        }}
      />

      {/* Content */}
      <div
        className="relative px-6 text-center"
        style={{ zIndex: 1, maxWidth: 900, margin: '0 auto', paddingTop: 96, paddingBottom: 72 }}
      >
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 text-sm font-medium mb-8"
          style={{
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            padding: '8px 18px', borderRadius: 100,
            color: '#5A3B29',
          }}
        >
          <Cat size={15} style={{ color: '#E285AF', flexShrink: 0 }} />
          Cada compra ayuda a un gatito en situación de calle
        </div>

        {/* Title */}
        <h1
          className="font-fraunces font-bold text-brown"
          style={{ fontSize: 'clamp(2.8rem, 6vw, 3.6rem)', lineHeight: 1.08, letterSpacing: '-0.01em', marginBottom: 0 }}
        >
          La pastelería
          <span
            className="font-caveat block"
            style={{ color: '#E285AF', fontSize: '1.05em', fontWeight: 700 }}
          >
            de Román
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-brown-soft mx-auto"
          style={{ fontSize: '1.08rem', lineHeight: 1.65, maxWidth: 560, marginTop: 24, marginBottom: 36 }}
        >
          Un postre para vos, una ayuda para ellos. Cookies, tortas y postres
          bajoneros hechos con amor.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white no-underline"
            style={{
              background: 'linear-gradient(135deg, #F0A0C4, #E285AF)',
              padding: '13px 28px', borderRadius: 100,
              boxShadow: '0 6px 18px rgba(226,133,175,0.45)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 10px 22px rgba(226,133,175,0.55)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(226,133,175,0.45)'
            }}
          >
            <Cookie size={16} />
            Ver el catálogo
          </Link>

          <a
            href="#como-pedir"
            className="btn-animated-border inline-flex items-center gap-2 text-sm font-semibold no-underline"
            style={{
              background: '#FDF6EC',
              border: '1.5px solid rgba(58,36,23,0.18)',
              padding: '13px 28px', borderRadius: 100,
              color: '#5A3B29',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(58,36,23,0.04)')}
            onMouseLeave={e => (e.currentTarget.style.background = '#FDF6EC')}
          >
            Cómo pedir
          </a>
        </div>

        {/* Meta info */}
        <div
          className="flex flex-wrap gap-8 justify-center text-brown-soft"
          style={{ fontSize: '0.88rem', marginTop: 52 }}
        >
          {[
            { Icon: Clock,      text: '48 hs de anticipación' },
            { Icon: Package,    text: 'Retiro o delivery en CABA' },
            { Icon: CreditCard, text: 'Seña por Mercado Pago' },
          ].map(({ Icon, text }) => (
            <span key={text} className="flex items-center gap-2">
              <Icon size={16} style={{ color: '#E285AF', flexShrink: 0 }} />
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

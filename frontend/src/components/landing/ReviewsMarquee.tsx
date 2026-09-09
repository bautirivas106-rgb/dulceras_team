import { Marquee } from '@/components/ui/marquee'

const REVIEWS = [
  {
    name: 'Martina G.',
    location: 'Almagro',
    stars: 5,
    text: 'Las cookies son increíbles, las mejores que probé. Y encima cada compra ayuda a los gatitos — no hay con qué darle.',
  },
  {
    name: 'Valentina R.',
    location: 'Palermo',
    stars: 5,
    text: 'Pedí la torta de chocolate para el cumple de mi nena. Un éxito total, presentación hermosa y un sabor que no olvidamos.',
  },
  {
    name: 'Sofía L.',
    location: 'Caballito',
    stars: 5,
    text: 'Todo riquísimo y Román siempre un 10. El tiramisú es una locura, cremoso y con el sabor justo que buscaba.',
  },
  {
    name: 'Agustina P.',
    location: 'Boedo',
    stars: 5,
    text: 'Los brownies son lo más esponjosos y húmedos que comí. Siempre listos a tiempo y el packaging es divino.',
  },
  {
    name: 'Camila B.',
    location: 'Villa Crespo',
    stars: 5,
    text: 'Siempre superan mis expectativas. Cada detalle del packaging y el sabor de los productos es increíble.',
  },
  {
    name: 'Lucrecia M.',
    location: 'San Telmo',
    stars: 5,
    text: 'El cheesecake de dulce de leche fue la sensación en la reunión. Todos me preguntaron dónde lo compré.',
  },
]

function ReviewCard({ name, location, stars, text }: typeof REVIEWS[0]) {
  return (
    <div
      className="flex-none bg-white rounded-2xl"
      style={{
        width: 320,
        padding: '22px 24px',
        borderTop: '3px solid #E285AF',
        boxShadow: '0 8px 24px rgba(58,36,23,0.07)',
      }}
    >
      <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
        {/* Avatar */}
        <div
          className="flex-shrink-0 flex items-center justify-center font-semibold text-white rounded-full"
          style={{
            width: 44, height: 44,
            background: 'linear-gradient(135deg, #F0A0C4, #E285AF)',
            fontSize: '1rem',
          }}
        >
          {name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-brown text-sm leading-tight">{name}</p>
          <p className="text-brown-soft" style={{ fontSize: '0.78rem' }}>{location}</p>
        </div>
        <div className="flex gap-0.5 flex-shrink-0">
          {Array.from({ length: stars }).map((_, i) => (
            <span key={i} style={{ color: '#E285AF', fontSize: '0.85rem' }}>★</span>
          ))}
        </div>
      </div>
      <p className="text-brown-soft" style={{ fontSize: '0.88rem', lineHeight: 1.55 }}>
        "{text}"
      </p>
    </div>
  )
}

export default function ReviewsMarquee() {
  return (
    <section id="resenas" className="py-24" style={{ background: '#FDF6EC', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ maxWidth: 600, margin: '0 auto 48px', textAlign: 'center', padding: '0 24px' }}>
        <p
          className="font-semibold text-pink-deep"
          style={{ fontSize: '0.82rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}
        >
          Lo que dicen
        </p>
        <h2
          className="font-fraunces font-bold text-brown"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: 12 }}
        >
          Reseñas de clientes
        </h2>
        <p className="text-brown-soft" style={{ fontSize: '0.95rem' }}>
          Más de 500 clientes felices en Buenos Aires. Esto es lo que nos cuentan.
        </p>
      </div>

      {/* Marquee */}
      <Marquee pauseOnHover durationSeconds={42} className="gap-5">
        {REVIEWS.map((r, i) => (
          <ReviewCard key={i} {...r} />
        ))}
      </Marquee>
    </section>
  )
}

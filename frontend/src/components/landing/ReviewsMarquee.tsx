import { useEffect, useState } from 'react'
import { Marquee } from '@/components/ui/marquee'
import { getReviews, type Review } from '@/api/customerApi'

const FALLBACK: Review[] = [
  { id: -1, author_name: 'Martina G.', rating: 5, text: 'Las cookies son increíbles, las mejores que probé. Y encima cada compra ayuda a los gatitos — no hay con qué darle.', created_at: '' },
  { id: -2, author_name: 'Valentina R.', rating: 5, text: 'Pedí la torta de chocolate para el cumple de mi nena. Un éxito total, presentación hermosa y un sabor que no olvidamos.', created_at: '' },
  { id: -3, author_name: 'Sofía L.', rating: 5, text: 'Todo riquísimo y Román siempre un 10. El tiramisú es una locura, cremoso y con el sabor justo que buscaba.', created_at: '' },
  { id: -4, author_name: 'Agustina P.', rating: 5, text: 'Los brownies son lo más esponjosos y húmedos que comí. Siempre listos a tiempo y el packaging es divino.', created_at: '' },
  { id: -5, author_name: 'Camila B.', rating: 5, text: 'Siempre superan mis expectativas. Cada detalle del packaging y el sabor de los productos es increíble.', created_at: '' },
  { id: -6, author_name: 'Lucrecia M.', rating: 5, text: 'El cheesecake de dulce de leche fue la sensación en la reunión. Todos me preguntaron dónde lo compré.', created_at: '' },
]

function ReviewCard({ author_name, rating, text }: Review) {
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
        <div
          className="flex-shrink-0 flex items-center justify-center font-semibold text-white rounded-full"
          style={{
            width: 44, height: 44,
            background: 'linear-gradient(135deg, #F0A0C4, #E285AF)',
            fontSize: '1rem', fontFamily: 'Fraunces, Georgia, serif',
          }}
        >
          {author_name[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-brown text-sm leading-tight">{author_name}</p>
        </div>
        <div className="flex gap-0.5 flex-shrink-0">
          {Array.from({ length: rating }).map((_, i) => (
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
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    getReviews()
      .then(data => setReviews(data.length >= 3 ? data : [...data, ...FALLBACK].slice(0, Math.max(data.length + FALLBACK.length, 6))))
      .catch(() => setReviews(FALLBACK))
  }, [])

  const items = reviews.length > 0 ? reviews : FALLBACK

  return (
    <section id="resenas" className="py-24" style={{ background: '#FDF6EC', overflow: 'hidden' }}>
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

      <Marquee pauseOnHover durationSeconds={42} className="gap-5">
        {items.map((r) => (
          <ReviewCard key={r.id} {...r} />
        ))}
      </Marquee>
    </section>
  )
}

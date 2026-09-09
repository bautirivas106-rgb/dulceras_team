import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, Cake, ChefHat, Coffee, Sandwich, Star, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Category { id: number; name: string; slug: string; description: string }

const CAT_CONFIG: Record<string, { Icon: LucideIcon; bg: string; iconColor: string; accent: string }> = {
  'cookies-ny':       { Icon: Cookie,   bg: '#FEF9C3', iconColor: '#92400E', accent: '#F59E0B' },
  'budines':          { Icon: Sandwich, bg: '#D1FAE5', iconColor: '#065F46', accent: '#10B981' },
  'tortas':           { Icon: Cake,     bg: '#FCE7F3', iconColor: '#9D174D', accent: '#EC4899' },
  'postres-bajoneros':{ Icon: Coffee,   bg: '#EDE9FE', iconColor: '#5B21B6', accent: '#8B5CF6' },
  'brownie-box':      { Icon: ChefHat,  bg: '#FEF3C7', iconColor: '#92400E', accent: '#D97706' },
  'chipa':            { Icon: Star,     bg: '#FFF0F8', iconColor: '#9D174D', accent: '#EC4899' },
}

const DEFAULT_CFG = { Icon: ChefHat, bg: '#F4BDE0', iconColor: '#9D174D', accent: '#EC4899' }

export default function CatalogPreview() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/public/dulceras-team/categories/')
      .then(r => r.json())
      .then(d => setCategories(d.results ?? d))
      .catch(() => {})
  }, [])

  return (
    <section id="catalogo" className="py-20 px-6" style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #FDF6EC 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Catálogo ♡</p>
          <h2 className="text-3xl md:text-4xl font-bold text-chocolate mb-3">Descubrí nuestras categorías</h2>
          <p className="text-mocha max-w-md mx-auto">Desde cookies gigantes hasta tortas enteras. Algo para cada antojo.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map(cat => {
            const { Icon, bg, iconColor, accent } = CAT_CONFIG[cat.slug] ?? DEFAULT_CFG
            return (
              <Link
                key={cat.id}
                to={`/catalogo?categoria=${cat.slug}`}
                className="group relative rounded-3xl overflow-hidden border border-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white"
              >
                <div className="p-6 md:p-8 flex flex-col items-center text-center min-h-[180px] justify-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm"
                    style={{ background: bg }}
                  >
                    <Icon size={30} style={{ color: iconColor }} strokeWidth={1.6} />
                  </div>
                  <div>
                    <h3 className="font-bold text-chocolate text-sm md:text-base leading-snug mb-1">{cat.name}</h3>
                    <p className="text-xs text-mocha/80 line-clamp-2">{cat.description}</p>
                  </div>
                </div>
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-3xl"
                  style={{ background: accent }}
                />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <ArrowRight size={14} style={{ color: accent }} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 border-2 border-brand text-brand font-semibold px-8 py-3.5 rounded-full hover:bg-brand hover:text-white transition-colors"
          >
            Ver todos los productos <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, Clock, Cookie, Cake, ChefHat, Coffee, Sandwich, Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { gradientButtonVariants } from '@/components/ui/gradient-button'

interface Variant { id: number; name: string; price: string }
interface Category { id: number; name: string; slug: string }
interface Product {
  id: number; name: string; description: string; image_url: string | null
  requires_advance_hours: number; made_to_order: boolean
  category: Category; variants: Variant[]
}

const ICON_MAP: [string, LucideIcon, string, string][] = [
  ['cookie',    Cookie,   '#FDE68A', '#92400E'],
  ['torta',     Cake,     '#F4BDE0', '#9D174D'],
  ['brownie',   ChefHat,  '#FDD5B5', '#7C2D12'],
  ['budín',     Sandwich, '#BBF7D0', '#166534'],
  ['budin',     Sandwich, '#BBF7D0', '#166534'],
  ['tiramisú',  Coffee,   '#DDD6FE', '#5B21B6'],
  ['tiramisu',  Coffee,   '#DDD6FE', '#5B21B6'],
  ['chipá',     Star,     '#FEF9C3', '#A16207'],
  ['chipa',     Star,     '#FEF9C3', '#A16207'],
  ['postre',    ChefHat,  '#FCE7F3', '#9D174D'],
  ['cheesecake',Cake,     '#FFF3C4', '#B45309'],
]

function getIcon(name: string): [LucideIcon, string, string] {
  const low = name.toLowerCase()
  const match = ICON_MAP.find(([k]) => low.includes(k))
  return match ? [match[1], match[2], match[3]] : [ChefHat, '#F4BDE0', '#9D174D']
}

function ProductCard({ p }: { p: Product }) {
  const min = p.variants.length ? Math.min(...p.variants.map(v => +v.price)) : null
  const [Icon, bg, iconColor] = getIcon(p.name)

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="h-48 flex items-center justify-center relative" style={{ background: `${bg}60` }}>
        {p.image_url
          ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
          : (
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300" style={{ background: bg }}>
              <Icon size={36} style={{ color: iconColor }} strokeWidth={1.5} />
            </div>
          )
        }
        {p.made_to_order && (
          <span className="absolute top-3 left-3 bg-brand text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">A pedido</span>
        )}
      </div>
      <div className="p-5">
        <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-1">{p.category.name}</p>
        <h3 className="font-bold text-chocolate text-base mb-1.5 leading-snug">{p.name}</h3>
        <p className="text-xs text-mocha mb-4 line-clamp-2 leading-relaxed">{p.description}</p>
        <div className="flex items-center justify-between">
          <div>
            {min !== null && <p className="font-bold text-chocolate text-sm">Desde ${min.toLocaleString('es-AR')}</p>}
            <p className="flex items-center gap-1 text-[10px] text-mocha mt-0.5">
              <Clock size={10} /> {p.requires_advance_hours} hs de anticipación
            </p>
          </div>
          <Link to="/catalogo" className="text-xs font-semibold bg-brand-soft text-brand-dark px-3.5 py-2 rounded-full hover:bg-brand hover:text-white transition-colors">
            Pedir
          </Link>
        </div>
      </div>
    </div>
  )
}

function Skeleton() {
  return <div className="rounded-3xl bg-gray-100 h-80 animate-pulse" />
}

export default function MenuPreview() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/public/dulceras-team/products/')
      .then(r => r.json())
      .then(d => setProducts((d.results ?? []).slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="menu" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Nuestro menú ♡</p>
            <h2 className="text-3xl md:text-4xl font-bold text-chocolate">Lo más pedido</h2>
            <p className="text-mocha mt-2">Elaborados a mano con ingredientes seleccionados.</p>
          </div>
          <Link to="/catalogo" className="inline-flex items-center gap-2 text-brand font-semibold text-sm hover:text-brand-dark transition-colors whitespace-nowrap">
            Ver todo el catálogo <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
            : products.map(p => <ProductCard key={p.id} p={p} />)
          }
        </div>

        <div className="text-center mt-12">
          <Link to="/catalogo" className={gradientButtonVariants({ variant: 'chocolate' })}>
            <ShoppingBag size={18} />
            Ver catálogo completo
          </Link>
        </div>
      </div>
    </section>
  )
}

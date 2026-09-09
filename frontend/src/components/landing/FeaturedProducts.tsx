import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MOCK_FEATURED_PRODUCTS } from '@/mocks/featuredProducts'
import type { PublicProduct } from '@/types/landing'

const PRODUCT_EMOJI: Record<string, string> = {
  cookie: '🍪', torta: '🎂', brownie: '🍫', cheesecake: '🍰',
  budín: '🍞', postre: '🍮', chipá: '🧀',
}

function productEmoji(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, e] of Object.entries(PRODUCT_EMOJI)) {
    if (lower.includes(key)) return e
  }
  return '🍰'
}

function ProductCard({ product }: { product: PublicProduct }) {
  return (
    <Card className="overflow-hidden group hover:shadow-md transition-shadow">
      {/* Imagen / placeholder */}
      <div
        className="h-52 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #F4BDE0, #ED58AA18)' }}
        aria-label={`Foto de ${product.name} — reemplazar con imagen real`}
        data-placeholder="product-image"
      >
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
          : <span className="text-5xl">{productEmoji(product.name)}</span>
        }
      </div>

      <CardContent>
        {product.categoryName && (
          <p className="text-xs font-semibold text-brand uppercase tracking-wide mb-1">{product.categoryName}</p>
        )}
        <h3 className="font-bold text-chocolate text-base mb-1 group-hover:text-brand transition-colors">{product.name}</h3>
        {product.shortDescription && (
          <p className="text-sm text-mocha leading-relaxed mb-3 line-clamp-2">{product.shortDescription}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-bold text-chocolate text-sm">{product.formattedPrice ?? `$${product.price}`}</span>
          <Link
            to="/catalogo"
            className="text-xs font-semibold text-brand hover:text-brand-dark transition-colors flex items-center gap-1"
            aria-label={`Ver ${product.name} en catálogo`}
          >
            Ver producto <ArrowRight size={12} />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// TODO: reemplazar MOCK_FEATURED_PRODUCTS con fetch a /api/public/products/featured/
const products = MOCK_FEATURED_PRODUCTS

export default function FeaturedProducts() {
  return (
    <section id="destacados" className="bg-brand-neutral/40 px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-brand uppercase tracking-widest mb-2">Lo más pedido</p>
          <h2 className="text-3xl md:text-4xl font-bold text-chocolate">Nuestros favoritos</h2>
          <p className="text-mocha mt-2 max-w-md mx-auto">Los productos que no paran de venderse. Hechos a mano, con ingredientes de calidad.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" onClick={() => { window.location.href = '/catalogo' }}>
            Ver todo el catálogo
          </Button>
        </div>
      </div>
    </section>
  )
}

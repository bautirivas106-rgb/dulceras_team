import { useState } from 'react'
import { useCategories, useProducts } from '../../hooks/useCatalog'
import { BrandingProvider } from '../../context/BrandingContext'
import Header from '../landing/sections/Header'
import CategoryTabs from '../landing/sections/CategoryTabs'
import ProductGrid from '../landing/sections/ProductGrid'
import HowToOrder from '../landing/sections/HowToOrder'
import CatsStory from '../landing/sections/CatsStory'
import Footer from '../landing/sections/Footer'

const TENANT = 'dulceras-team'

function CatalogContent() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const { categories, loading: catsLoading } = useCategories(TENANT)
  const { products, loading: prodsLoading } = useProducts(TENANT, activeCategory ?? undefined)

  return (
    <div className="min-h-screen font-poppins" style={{ background: '#FDF6EC' }}>
      <Header />

      <section id="catalogo" className="px-6 py-16" style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div className="text-center mb-10">
          <p
            className="font-semibold text-pink-deep"
            style={{ fontSize: '0.82rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}
          >
            Hecho a mano, con amor
          </p>
          <h1 className="font-fraunces font-bold text-brown" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)' }}>
            Nuestro catálogo
          </h1>
        </div>

        {!catsLoading && categories.length > 0 && (
          <div className="mb-6">
            <CategoryTabs categories={categories} active={activeCategory} onChange={setActiveCategory} />
          </div>
        )}

        <ProductGrid products={products} loading={prodsLoading} />
      </section>

      <HowToOrder />
      <CatsStory />
      <Footer />
    </div>
  )
}

export default function CatalogPage() {
  return (
    <BrandingProvider tenant={TENANT}>
      <CatalogContent />
    </BrandingProvider>
  )
}

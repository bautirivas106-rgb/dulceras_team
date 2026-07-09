import { useState } from 'react'
import { useCategories, useProducts } from '../../hooks/useCatalog'
import Header from './sections/Header'
import Hero from './sections/Hero'
import CategoryTabs from './sections/CategoryTabs'
import ProductGrid from './sections/ProductGrid'
import HowToOrder from './sections/HowToOrder'
import CatsStory from './sections/CatsStory'
import Footer from './sections/Footer'

const TENANT = 'dulceras-team'

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const { categories, loading: catsLoading } = useCategories(TENANT)
  const { products, loading: prodsLoading } = useProducts(TENANT, activeCategory ?? undefined)

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <Header />
      <Hero />

      {/* Catálogo */}
      <section id="catalogo" className="px-4 py-12 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-[#E8889A] uppercase tracking-widest mb-2">
            Hecho a mano, con amor
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#3D1A0E]">
            Nuestro catálogo
          </h2>
        </div>

        {!catsLoading && categories.length > 0 && (
          <div className="mb-6">
            <CategoryTabs
              categories={categories}
              active={activeCategory}
              onChange={setActiveCategory}
            />
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

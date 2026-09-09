import { ThreeDPhotoCarousel } from '@/components/ui/three-d-photo-carousel'
import { MOCK_CAROUSEL_IMAGES } from '@/mocks/carouselImages'

export default function CarouselSection() {
  return (
    <section id="productos" className="bg-white px-6 py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-brand uppercase tracking-widest mb-2">Nuestros productos ♡</p>
          <h2 className="text-3xl md:text-4xl font-bold text-chocolate">Descubrí nuestras delicias</h2>
          <p className="text-mocha mt-2 text-sm">Arrastrá para ver más</p>
        </div>

        <ThreeDPhotoCarousel images={MOCK_CAROUSEL_IMAGES} autoRotate />
      </div>
    </section>
  )
}

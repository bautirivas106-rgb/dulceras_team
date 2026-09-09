import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import CatalogCarousel from '@/components/landing/CatalogCarousel'
import OrderSteps from '@/components/landing/OrderSteps'
import ReviewsMarquee from '@/components/landing/ReviewsMarquee'
import LandingFooter from '@/components/landing/LandingFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen font-poppins" style={{ background: '#FDF6EC' }}>
      <Navbar />
      <main>
        <HeroSection />
        <CatalogCarousel />
        <OrderSteps />
        <ReviewsMarquee />
      </main>
      <LandingFooter />
    </div>
  )
}

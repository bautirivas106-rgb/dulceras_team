import { Link } from 'react-router-dom'
import { ShoppingBag, MessageCircle, Cake, Cookie, Sparkles } from 'lucide-react'
import { gradientButtonVariants } from '@/components/ui/gradient-button'

export default function FinalCta() {
  return (
    <section className="overflow-hidden" style={{ background: 'linear-gradient(135deg, #F4BDE0, #ED58AA30, #FDF6EC)' }}>
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-10">

        {/* Texto */}
        <div className="flex-1">
          <h2 className="text-3xl md:text-5xl font-bold text-chocolate leading-tight mb-4">
            ¿Lista para endulzar<br />
            tus <span className="text-brand">mejores</span> momentos?
          </h2>
          <p className="text-mocha mb-8 leading-relaxed">Hacemos que cada ocasión sea especial.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/catalogo" className={gradientButtonVariants({ variant: 'default' })}>
              <ShoppingBag size={16} />
              Hacer un pedido
            </Link>
            <a
              href="https://wa.me/5491112345678"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-chocolate/30 bg-white text-chocolate font-semibold px-7 py-3.5 rounded-full hover:bg-white/80 transition-colors text-sm"
            >
              <MessageCircle size={16} />
              Escribinos por WhatsApp
            </a>
          </div>
        </div>

        {/* Visual */}
        <div className="flex-1 flex justify-center">
          <div
            className="w-72 h-56 md:w-80 md:h-64 rounded-3xl flex items-center justify-center shadow-xl"
            style={{ background: 'linear-gradient(135deg, #FDECEA, #F4BDE0)' }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Cookie size={28} className="text-amber-600" strokeWidth={1.6} />
                </div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Cake size={28} className="text-brand" strokeWidth={1.6} />
                </div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Sparkles size={28} className="text-amber-500" strokeWidth={1.6} />
                </div>
              </div>
              <div className="bg-white/80 rounded-xl px-5 py-2 text-center">
                <span style={{ fontFamily: 'var(--font-logo)', color: '#ED58AA', fontSize: '1.3rem' }}>Dulceras</span>
                <p className="text-[9px] font-bold text-chocolate/60 tracking-widest">TEAM ♡</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

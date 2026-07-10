export default function Hero() {
  return (
    <section id="inicio" className="bg-cream px-4 py-16 md:py-24 text-center">
      <div className="max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-rose-light text-mocha text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <span>🐱</span>
          <span>Cada compra ayuda a un gatito en situación de calle</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-chocolate leading-tight mb-4">
          La pastelería<br />
          <span className="text-rose">de Román</span>
        </h1>

        <p className="text-lg md:text-xl text-mocha mb-8 max-w-xl mx-auto leading-relaxed">
          Un postre para vos, una ayuda para ellos.
          Cookies, tortas y postres bajoneros hechos con amor en Almagro.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#catalogo"
            className="bg-rose hover:opacity-90 text-white font-bold px-8 py-3.5 rounded-full transition-opacity shadow-md text-base"
          >
            Ver el catálogo 🍪
          </a>
          <a
            href="#como-pedir"
            className="border-2 border-caramel text-mocha hover:bg-cream-dark font-semibold px-8 py-3.5 rounded-full transition-colors text-base"
          >
            Cómo pedir
          </a>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-mocha-light">
          <span className="flex items-center gap-1.5"><span>⏰</span> 48 hs de anticipación</span>
          <span className="flex items-center gap-1.5"><span>📦</span> Retiro o delivery en CABA</span>
          <span className="flex items-center gap-1.5"><span>💳</span> Seña por Mercado Pago</span>
        </div>
      </div>
    </section>
  )
}

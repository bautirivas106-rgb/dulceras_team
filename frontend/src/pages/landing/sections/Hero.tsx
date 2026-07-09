export default function Hero() {
  return (
    <section
      id="inicio"
      className="bg-[#FDF6EC] px-4 py-16 md:py-24 text-center"
    >
      <div className="max-w-3xl mx-auto">
        {/* Badge gatitos */}
        <div className="inline-flex items-center gap-2 bg-[#F7D0D8] text-[#7C4A2D] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <span>🐱</span>
          <span>Cada compra ayuda a un gatito en situación de calle</span>
        </div>

        {/* Título */}
        <h1 className="text-4xl md:text-6xl font-bold text-[#3D1A0E] leading-tight mb-4">
          La pastelería<br />
          <span className="text-[#E8889A]">de Román</span>
        </h1>

        {/* Subtítulo */}
        <p className="text-lg md:text-xl text-[#7C4A2D] mb-8 max-w-xl mx-auto leading-relaxed">
          Un postre para vos, una ayuda para ellos.
          Cookies, tortas y postres bajoneros hechos con amor en Almagro.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#catalogo"
            className="bg-[#E8889A] hover:bg-[#d9768a] text-white font-bold px-8 py-3.5 rounded-full transition-colors shadow-md text-base"
          >
            Ver el catálogo 🍪
          </a>
          <a
            href="#como-pedir"
            className="border-2 border-[#D4A76A] text-[#7C4A2D] hover:bg-[#F5E8D0] font-semibold px-8 py-3.5 rounded-full transition-colors text-base"
          >
            Cómo pedir
          </a>
        </div>

        {/* Info rápida */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-[#A0673A]">
          <span className="flex items-center gap-1.5">
            <span>⏰</span> 48 hs de anticipación
          </span>
          <span className="flex items-center gap-1.5">
            <span>📦</span> Retiro o delivery en CABA
          </span>
          <span className="flex items-center gap-1.5">
            <span>💳</span> Seña por Mercado Pago
          </span>
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  { icon: '🛒', title: 'Elegís tu antojo', desc: 'Explorá el catálogo, elegí el producto y el tamaño que más te tienta.' },
  { icon: '💳', title: 'Mandás la seña', desc: 'Confirmás el pedido con una seña por Mercado Pago. Rápido y seguro.' },
  { icon: '📦', title: 'Coordinamos y listo', desc: 'Te avisamos cuando está listo. Retirás en Almagro o te lo llevamos a CABA.' },
]

export default function HowToOrder() {
  return (
    <section id="como-pedir" className="bg-cream-dark px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-xs font-semibold text-rose uppercase tracking-widest mb-2">Simple y sin vueltas</p>
        <h2 className="text-3xl md:text-4xl font-bold text-chocolate mb-12">Cómo pedir</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={i} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-caramel opacity-40" />
              )}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center text-3xl mb-4 shadow-sm border border-caramel/50">
                  {step.icon}
                </div>
                <div className="w-6 h-6 bg-rose rounded-full flex items-center justify-center text-white text-xs font-bold mb-3">
                  {i + 1}
                </div>
                <h3 className="font-bold text-chocolate text-lg mb-2">{step.title}</h3>
                <p className="text-mocha text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-cream rounded-2xl p-6 border border-caramel/30">
          <p className="text-mocha text-sm">
            ⏰ <strong className="text-chocolate">Anticipación mínima:</strong> 48 horas antes de la fecha que necesitás tu pedido.{' '}
            📍 <strong className="text-chocolate">Delivery:</strong> zona CABA con costo según barrio. Retiro gratis en Almagro.
          </p>
        </div>
      </div>
    </section>
  )
}

export default function CatsStory() {
  return (
    <section id="nosotros" className="bg-[#FDF6EC] px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Texto */}
          <div>
            <p className="text-xs font-semibold text-[#E8889A] uppercase tracking-widest mb-2">
              Nuestra historia
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#3D1A0E] mb-5 leading-tight">
              Un postre para vos,<br />
              <span className="text-[#E8889A]">una ayuda para ellos</span>
            </h2>
            <p className="text-[#7C4A2D] leading-relaxed mb-4">
              Román arrancó haciendo cookies en casa porque le apasionaba la pastelería.
              Con el tiempo se dio cuenta que podía hacer algo más grande: cada pedido
              que le hacen ayuda a financiar el cuidado de gatitos en situación de calle.
            </p>
            <p className="text-[#7C4A2D] leading-relaxed mb-6">
              Todo es artesanal, con ingredientes de calidad, y con mucho amor.
              No es solo un postre — es una forma de hacer bien al mundo comiendo rico.
            </p>
            <div className="flex items-center gap-3 bg-[#F7D0D8] rounded-2xl px-5 py-4">
              <span className="text-3xl">🐱</span>
              <div>
                <p className="font-bold text-[#3D1A0E] text-sm">Gatitos ayudados</p>
                <p className="text-[#7C4A2D] text-xs">
                  Parte de cada venta va directo a su cuidado y esterilización.
                </p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="grid grid-cols-2 gap-4">
            {['🍪', '🎂', '🍫', '🐱'].map((emoji, i) => (
              <div
                key={i}
                className={`rounded-2xl flex items-center justify-center text-5xl shadow-sm border border-[#F5E8D0] ${
                  i % 2 === 0 ? 'bg-[#F7D0D8] h-36' : 'bg-[#F5E8D0] h-28'
                } ${i === 1 ? 'mt-6' : ''} ${i === 3 ? '-mt-6' : ''}`}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

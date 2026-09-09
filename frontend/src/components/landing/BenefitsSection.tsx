import { ChefHat, Leaf, PawPrint, Package } from 'lucide-react'

const BENEFITS = [
  { Icon: ChefHat,  color: '#FDE68A', text: '#92400E', title: 'Artesanal',    desc: 'Todo es elaborado de manera artesanal y con mucho amor.' },
  { Icon: Leaf,     color: '#BBF7D0', text: '#166534', title: 'Ingredientes', desc: 'Seleccionamos los mejores ingredientes para lograr sabores únicos.' },
  { Icon: PawPrint, color: '#F4BDE0', text: '#9D174D', title: 'Para todos',   desc: 'Opciones para compartir, celebrar y disfrutar en cada ocasión.' },
  { Icon: Package,  color: '#DDD6FE', text: '#6D28D9', title: 'A tu manera',  desc: 'Elegí retiro o entrega y disfrutá sin preocuparte por nada.' },
]

export default function BenefitsSection() {
  return (
    <section className="px-6 py-20" style={{ background: '#FDF6EC' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-brand uppercase tracking-widest mb-2">¿Por qué elegirnos? ♡</p>
          <h2 className="text-3xl md:text-4xl font-bold text-chocolate">Dedicación en cada detalle</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map(({ Icon, color, text, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-brand-soft/40 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: color }}>
                <Icon size={24} style={{ color: text }} strokeWidth={1.8} />
              </div>
              <h3 className="font-bold text-brand text-base mb-2">{title}</h3>
              <p className="text-sm text-mocha leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

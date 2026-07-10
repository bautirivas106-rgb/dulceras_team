import { useBranding } from '../../../context/BrandingContext'

export default function Footer() {
  const { business_name } = useBranding()

  return (
    <footer className="bg-chocolate text-cream px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🍫</span>
              <span className="font-bold text-lg text-white">{business_name}</span>
            </div>
            <p className="text-caramel text-sm leading-relaxed">
              Pastelería artesanal en Almagro, Buenos Aires.
              Cada compra ayuda a un gatito. 🐱
            </p>
          </div>

          <div>
            <p className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Navegá</p>
            <ul className="space-y-2 text-sm text-caramel">
              <li><a href="#inicio" className="hover:text-white transition-colors">Inicio</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Catálogo</a></li>
              <li><a href="#como-pedir" className="hover:text-white transition-colors">Cómo pedir</a></li>
              <li><a href="#nosotros" className="hover:text-white transition-colors">Nuestra historia</a></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Contacto</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="https://www.instagram.com/dulceras.team" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-caramel hover:text-white transition-colors">
                  <span>📸</span> @dulceras.team
                </a>
              </li>
              <li>
                <a href="https://wa.me/5491100000000" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-caramel hover:text-white transition-colors">
                  <span>💬</span> WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2 text-caramel">
                <span>📍</span> Almagro, Buenos Aires
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-mocha pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-mocha-light">
            © {new Date().getFullYear()} {business_name}. Hecho con 🍫 y 🐱 en Buenos Aires.
          </p>
          <p className="text-xs text-mocha-light">Cada pedido ayuda a gatitos en situación de calle.</p>
        </div>
      </div>
    </footer>
  )
}

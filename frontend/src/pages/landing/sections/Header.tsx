import { useState } from 'react'
import { useCart } from '../../../context/CartContext'
import CartDrawer from '../../../components/CartDrawer'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { itemCount } = useCart()

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FDF6EC] border-b border-[#F5E8D0] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-2 text-[#3D1A0E] font-bold text-xl tracking-tight">
            <span className="text-2xl">🍫</span>
            <span>Dulceras Team</span>
          </a>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#7C4A2D]">
            <a href="#catalogo" className="hover:text-[#3D1A0E] transition-colors">Catálogo</a>
            <a href="#como-pedir" className="hover:text-[#3D1A0E] transition-colors">Cómo pedir</a>
            <a href="#nosotros" className="hover:text-[#3D1A0E] transition-colors">Nuestra historia</a>
          </nav>

          {/* Acciones derecha */}
          <div className="flex items-center gap-3">
            {/* Carrito */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-[#7C4A2D] hover:text-[#3D1A0E] transition-colors"
              aria-label="Ver carrito"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#E8889A] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center leading-none min-w-[18px] min-h-[18px] px-1">
                  {itemCount}
                </span>
              )}
            </button>

            {/* CTA desktop */}
            <a
              href="#catalogo"
              className="hidden md:inline-flex items-center gap-2 bg-[#E8889A] hover:bg-[#d9768a] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors shadow-sm"
            >
              Hacer pedido
            </a>

            {/* Hamburger mobile */}
            <button
              className="md:hidden text-[#3D1A0E] p-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#FDF6EC] border-t border-[#F5E8D0] px-4 py-4 flex flex-col gap-4 text-[#7C4A2D] font-medium text-sm">
            <a href="#catalogo" onClick={() => setMenuOpen(false)}>Catálogo</a>
            <a href="#como-pedir" onClick={() => setMenuOpen(false)}>Cómo pedir</a>
            <a href="#nosotros" onClick={() => setMenuOpen(false)}>Nuestra historia</a>
            <a
              href="#catalogo"
              onClick={() => setMenuOpen(false)}
              className="bg-[#E8889A] text-white px-4 py-2 rounded-full text-center font-semibold"
            >
              Hacer pedido
            </a>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../../context/CartContext'
import { useBranding } from '../../../context/BrandingContext'
import { useCustomerAuth } from '../../../context/CustomerAuthContext'
import CartDrawer from '../../../components/CartDrawer'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { itemCount } = useCart()
  const { business_name, logo_url } = useBranding()
  const { customer, isLoggedIn } = useCustomerAuth()

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream border-b border-cream-dark shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-2 text-chocolate font-bold text-xl tracking-tight">
            {logo_url
              ? <img src={logo_url} alt={business_name} className="h-8 w-auto object-contain" />
              : <span className="text-2xl">🍫</span>
            }
            <span>{business_name}</span>
          </a>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-mocha">
            <a href="#catalogo" className="hover:text-chocolate transition-colors">Catálogo</a>
            <a href="#como-pedir" className="hover:text-chocolate transition-colors">Cómo pedir</a>
            <a href="#nosotros" className="hover:text-chocolate transition-colors">Nuestra historia</a>
          </nav>

          {/* Acciones derecha */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                to="/cuenta/pedidos"
                className="hidden md:flex items-center gap-1.5 text-sm text-mocha hover:text-chocolate transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {customer?.name.split(' ')[0]}
              </Link>
            ) : (
              <Link
                to="/cuenta/login"
                className="hidden md:flex items-center gap-1.5 text-sm text-mocha hover:text-chocolate transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mi cuenta
              </Link>
            )}
            {/* carrito */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-mocha hover:text-chocolate transition-colors"
              aria-label="Ver carrito"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose text-white text-[10px] font-bold min-w-[18px] min-h-[18px] px-1 rounded-full flex items-center justify-center leading-none">
                  {itemCount}
                </span>
              )}
            </button>

            <a
              href="#catalogo"
              className="hidden md:inline-flex items-center gap-2 bg-rose hover:opacity-90 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-opacity shadow-sm"
            >
              Hacer pedido
            </a>

            <button
              className="md:hidden text-chocolate p-1"
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

        {menuOpen && (
          <div className="md:hidden bg-cream border-t border-cream-dark px-4 py-4 flex flex-col gap-4 text-mocha font-medium text-sm">
            <a href="#catalogo" onClick={() => setMenuOpen(false)}>Catálogo</a>
            <a href="#como-pedir" onClick={() => setMenuOpen(false)}>Cómo pedir</a>
            <a href="#nosotros" onClick={() => setMenuOpen(false)}>Nuestra historia</a>
            <Link to={isLoggedIn ? '/cuenta/pedidos' : '/cuenta/login'} onClick={() => setMenuOpen(false)}>
              {isLoggedIn ? `Mi cuenta (${customer?.name.split(' ')[0]})` : 'Mi cuenta'}
            </Link>
            <a
              href="#catalogo"
              onClick={() => setMenuOpen(false)}
              className="bg-rose text-white px-4 py-2 rounded-full text-center font-semibold"
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

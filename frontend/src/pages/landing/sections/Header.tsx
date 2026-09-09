import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ShoppingCart, User } from 'lucide-react'
import { useCart } from '../../../context/CartContext'
import { useCustomerAuth } from '../../../context/CustomerAuthContext'
import { DockRow, DockIcon } from '../../../components/ui/dock'
import CartDrawer from '../../../components/CartDrawer'

const NAV_LINKS = [
  { label: 'Catálogo',   href: '#catalogo' },
  { label: 'Cómo pedir', href: '#como-pedir' },
  { label: 'Reseñas',    href: '#nosotros' },
]

export default function Header() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [cartOpen, setCartOpen]   = useState(false)
  const { itemCount }             = useCart()
  const { customer, isLoggedIn }  = useCustomerAuth()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(253,246,236,0.8)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(58,36,23,0.08)',
          boxShadow: scrolled ? '0 6px 24px rgba(58,36,23,0.08)' : 'none',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        <div
          style={{ maxWidth: 1180, margin: '0 auto', padding: '14px 32px' }}
          className="px-6 md:px-8 flex items-center justify-between"
        >
          {/* Logo */}
          <a href="#catalogo" className="flex items-center gap-2.5 no-underline">
            <img
              src="/brand/logo-icon.png"
              alt="Dulceras Team"
              style={{ height: 38, width: 'auto', display: 'block', flexShrink: 0 }}
            />
            <img
              src="/brand/logo-wordmark.png"
              alt="Dulceras Team"
              className="hidden sm:block"
              style={{ height: 52, width: 'auto', display: 'block' }}
            />
          </a>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-9">
            {NAV_LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                className="nav-underline text-sm font-medium no-underline"
                style={{ color: '#5A3B29' }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-4">
            <DockRow>
              {/* Mi cuenta */}
              <DockIcon
                label={isLoggedIn ? (customer?.name.split(' ')[0] ?? 'Mi cuenta') : 'Mi cuenta'}
                onClick={() => {}}
              >
                <Link
                  to={isLoggedIn ? '/cuenta/pedidos' : '/cuenta/login'}
                  className="flex items-center justify-center w-full h-full no-underline"
                  style={{ color: 'inherit' }}
                >
                  <User size={18} />
                </Link>
              </DockIcon>

              {/* Carrito */}
              <DockIcon label={`Carrito${itemCount > 0 ? ` (${itemCount})` : ''}`} onClick={() => setCartOpen(true)}>
                <div className="relative flex items-center justify-center">
                  <ShoppingCart size={18} />
                  {itemCount > 0 && (
                    <span
                      className="absolute -top-2 -right-2 flex items-center justify-center text-white font-bold rounded-full leading-none"
                      style={{
                        background: '#E285AF',
                        fontSize: 9, minWidth: 16, minHeight: 16, padding: '1px 4px',
                      }}
                    >
                      {itemCount}
                    </span>
                  )}
                </div>
              </DockIcon>
            </DockRow>

            <a
              href="#catalogo"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white no-underline"
              style={{
                background: 'linear-gradient(135deg, #F0A0C4, #E285AF)',
                padding: '10px 22px', borderRadius: 100,
                boxShadow: '0 6px 18px rgba(226,133,175,0.45)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 10px 22px rgba(226,133,175,0.55)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(226,133,175,0.45)'
              }}
            >
              Hacer pedido
            </a>
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2"
              style={{ color: '#3A2417', background: 'none', border: 'none', cursor: 'pointer' }}
              aria-label="Ver carrito"
            >
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 flex items-center justify-center text-white font-bold rounded-full leading-none"
                  style={{ background: '#E285AF', fontSize: 9, minWidth: 16, minHeight: 16, padding: '1px 4px' }}
                >
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{ color: '#3A2417', background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav
            className="md:hidden px-6 py-5 flex flex-col gap-4 border-t"
            style={{ borderColor: 'rgba(58,36,23,0.08)', background: 'rgba(253,246,236,0.97)' }}
          >
            {NAV_LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium no-underline"
                style={{ color: '#5A3B29' }}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <Link
              to={isLoggedIn ? '/cuenta/pedidos' : '/cuenta/login'}
              className="text-sm font-medium no-underline"
              style={{ color: '#5A3B29' }}
              onClick={() => setMenuOpen(false)}
            >
              {isLoggedIn ? `Mi cuenta (${customer?.name.split(' ')[0]})` : 'Mi cuenta'}
            </Link>
            <a
              href="#catalogo"
              className="text-center text-sm font-semibold text-white py-3 rounded-full no-underline"
              style={{ background: 'linear-gradient(135deg, #F0A0C4, #E285AF)' }}
              onClick={() => setMenuOpen(false)}
            >
              Hacer pedido
            </a>
          </nav>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

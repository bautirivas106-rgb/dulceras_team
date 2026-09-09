import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, User, ShoppingCart } from 'lucide-react'
import { DockRow, DockIcon } from '@/components/ui/dock'

const NAV_LINKS = [
  { label: 'Catálogo',   href: '#catalogo' },
  { label: 'Cómo pedir', href: '#como-pedir' },
  { label: 'Reseñas',    href: '#resenas' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(253,246,236,0.8)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(58,36,23,0.08)',
        boxShadow: scrolled ? '0 6px 24px rgba(58,36,23,0.08)' : 'none',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: 1180, margin: '0 auto', padding: '16px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
        className="px-6 md:px-8"
      >
        {/* Logo */}
        <a href="#inicio" className="flex items-center gap-2.5 no-underline">
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
            <DockIcon label="Mi cuenta" onClick={() => navigate('/cuenta/login')}>
              <User size={18} />
            </DockIcon>
            <DockIcon label="Carrito" onClick={() => navigate('/checkout')}>
              <ShoppingCart size={18} />
            </DockIcon>
          </DockRow>

          <Link
            to="/catalogo"
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
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2"
          style={{ color: '#3A2417', background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
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
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/catalogo"
            className="text-center text-sm font-semibold text-white py-3 rounded-full no-underline"
            style={{ background: 'linear-gradient(135deg, #F0A0C4, #E285AF)' }}
            onClick={() => setOpen(false)}
          >
            Hacer pedido
          </Link>
        </nav>
      )}
    </header>
  )
}

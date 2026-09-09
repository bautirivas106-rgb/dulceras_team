import { useState } from 'react'
import { Camera, MessageCircle, MapPin, Clock, ArrowRight, Cat } from 'lucide-react'
import { DockRow, DockIcon } from '@/components/ui/dock'

const NAV_LINKS = [
  { label: 'Inicio',     href: '#inicio' },
  { label: 'Catálogo',   href: '#catalogo' },
  { label: 'Cómo pedir', href: '#como-pedir' },
  { label: 'Reseñas',    href: '#resenas' },
]

const CONTACT = [
  { Icon: Camera,      text: '@dulceras.team', href: 'https://www.instagram.com/dulceras.team' },
  { Icon: MessageCircle,  text: 'WhatsApp',        href: 'https://wa.me/5491112345678' },
  { Icon: MapPin,         text: 'Almagro, Buenos Aires' },
  { Icon: Clock,          text: 'Lun a sáb, 10 a 19 hs' },
]

const SOCIALS = [
  { Icon: Camera,     label: 'Camera', href: 'https://www.instagram.com/dulceras.team' },
  { Icon: MessageCircle, label: 'WhatsApp',  href: 'https://wa.me/5491112345678' },
]

const linkHover = {
  onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#fff'),
  onMouseLeave: (e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#D8C4AC'),
}

export default function LandingFooter() {
  const [email, setEmail]         = useState('')
  const [modoAntojo, setModoAntojo] = useState(false)

  return (
    <footer
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #4A2E1E 0%, #2E1B10 55%, #23140C 100%)',
        color: '#D8C4AC',
        padding: '72px 24px 0',
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12" style={{ paddingBottom: 64 }}>

          {/* Col 1 — Newsletter */}
          <div>
            <p
              className="font-fraunces font-semibold"
              style={{ color: '#fff', fontSize: '1rem', marginBottom: 12 }}
            >
              Enterate de los antojos nuevos
            </p>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 16, color: '#D8C4AC' }}>
              Novedades, promociones y lanzamientos antes que nadie.
            </p>
            <form
              onSubmit={e => { e.preventDefault(); setEmail('') }}
              className="flex items-center rounded-full overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ padding: '10px 16px', color: '#fff' }}
              />
              <button
                type="submit"
                aria-label="Suscribirse"
                className="flex items-center justify-center rounded-full m-1 flex-shrink-0"
                style={{
                  width: 34, height: 34,
                  background: 'linear-gradient(135deg, #F0A0C4, #E285AF)',
                  border: 'none', cursor: 'pointer', color: '#fff',
                }}
              >
                <ArrowRight size={15} />
              </button>
            </form>
          </div>

          {/* Col 2 — Nav */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#fff', marginBottom: 16 }}
            >
              Navegá
            </p>
            <ul className="space-y-2.5">
              {NAV_LINKS.map(l => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    style={{ color: '#D8C4AC', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    {...linkHover}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Contact */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#fff', marginBottom: 16 }}
            >
              Contacto
            </p>
            <ul className="space-y-3">
              {CONTACT.map(({ Icon, text, href }) => (
                <li key={text} className="flex items-start gap-2 text-sm">
                  <Icon size={14} style={{ color: '#D8C4AC', flexShrink: 0, marginTop: 2 }} />
                  {href
                    ? <a href={href} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#D8C4AC', textDecoration: 'none', transition: 'color 0.2s' }}
                        {...linkHover}>
                        {text}
                      </a>
                    : <span style={{ color: '#D8C4AC' }}>{text}</span>
                  }
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Seguinos */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#fff', marginBottom: 16 }}
            >
              Seguinos
            </p>

            <DockRow className="mb-5">
              {SOCIALS.map(({ Icon, label, href }) => (
                <DockIcon key={label} label={label} light onClick={() => window.open(href, '_blank')}>
                  <Icon size={18} />
                </DockIcon>
              ))}
            </DockRow>

            {/* Cat badge */}
            <div
              className="inline-flex items-center gap-2 text-xs rounded-full"
              style={{
                background: 'rgba(255,255,255,0.08)',
                padding: '8px 14px', marginBottom: 16,
                color: '#D8C4AC',
              }}
            >
              <Cat size={13} style={{ color: '#E285AF', flexShrink: 0 }} />
              Cada pedido ayuda a gatitos en situación de calle
            </div>

            {/* Decorative toggle */}
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '0.82rem', color: '#D8C4AC' }}>Modo antojo intenso</span>
              <button
                onClick={() => setModoAntojo(v => !v)}
                aria-label="Toggle modo antojo"
                style={{
                  width: 38, height: 22, borderRadius: 11, border: 'none',
                  background: modoAntojo
                    ? 'linear-gradient(135deg, #F0A0C4, #E285AF)'
                    : 'rgba(255,255,255,0.15)',
                  cursor: 'pointer', position: 'relative',
                  transition: 'background 0.3s ease', flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: 'absolute', top: 3,
                    left: modoAntojo ? 19 : 3,
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#fff', transition: 'left 0.3s ease',
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '20px 0', textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.8rem', color: 'rgba(216,196,172,0.6)', marginBottom: 6 }}>
            © 2026 Dulceras Team. Hecho con cariño en Buenos Aires. · Cada pedido ayuda a gatitos en situación de calle.
          </p>
          <p style={{ fontSize: '0.75rem', color: 'rgba(216,196,172,0.35)' }}>
            Sitio hecho por AuraDigital
          </p>
        </div>
      </div>
    </footer>
  )
}

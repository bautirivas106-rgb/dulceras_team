import { MapPin, Clock, Phone, Mail, MessageCircle, ExternalLink } from 'lucide-react'

const HOURS = [
  { days: 'Lunes a Viernes', hours: '9:00 – 19:00', open: true },
  { days: 'Sábados',          hours: '9:00 – 14:00', open: true },
  { days: 'Domingos',         hours: 'Cerrado',       open: false },
]

const CONTACT = [
  { Icon: Phone,         label: '11 1234 5678',             href: 'tel:+5491112345678' },
  { Icon: Mail,          label: 'hola@dulcerasteam.com.ar', href: 'mailto:hola@dulcerasteam.com.ar' },
  { Icon: MessageCircle, label: 'WhatsApp',                 href: 'https://wa.me/5491112345678' },
]

const MAPS_URL = 'https://www.google.com/maps/search/Lomas+del+Mirador,+Buenos+Aires'

export default function LocationSection() {
  return (
    <section id="ubicacion" className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">¿Dónde estamos? ♡</p>
          <h2 className="text-3xl md:text-4xl font-bold text-chocolate mb-3">Visitanos o pedí a domicilio</h2>
          <p className="text-mocha max-w-md mx-auto">Retiro gratuito en Lomas del Mirador. Delivery en CABA con costo según barrio.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Mapa estilizado */}
          <div
            className="rounded-3xl overflow-hidden relative min-h-[320px] flex items-center justify-center border border-brand-soft/40"
            style={{ background: 'linear-gradient(135deg, #FFF0F8, #FDF6EC)' }}
          >
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: 'linear-gradient(#ED58AA 1px, transparent 1px), linear-gradient(90deg, #ED58AA 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-brand rounded-full flex items-center justify-center shadow-2xl mx-auto mb-4 border-4 border-white">
                <MapPin size={36} className="text-white" />
              </div>
              <div className="bg-white rounded-2xl shadow-lg px-6 py-4 border border-brand-soft/40">
                <p className="font-bold text-chocolate">Dulceras Team</p>
                <p className="text-mocha text-sm mt-0.5">Lomas del Mirador, Buenos Aires</p>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-brand text-xs font-semibold mt-3 hover:text-brand-dark transition-colors"
                >
                  <ExternalLink size={12} /> Ver en Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* Info cards */}
          <div className="flex flex-col gap-4">

            {/* Horarios */}
            <div className="bg-cream rounded-2xl p-5 border border-brand-soft/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center">
                  <Clock size={17} className="text-white" />
                </div>
                <p className="font-bold text-chocolate">Horarios</p>
              </div>
              <div className="space-y-2.5">
                {HOURS.map(h => (
                  <div key={h.days} className="flex justify-between items-center text-sm">
                    <span className="text-mocha">{h.days}</span>
                    <span className={`font-semibold ${h.open ? 'text-chocolate' : 'text-red-400'}`}>{h.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Retiro / Delivery */}
            <div className="bg-cream rounded-2xl p-5 border border-brand-soft/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center">
                  <MapPin size={17} className="text-white" />
                </div>
                <p className="font-bold text-chocolate">Retiro y delivery</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white text-xs font-medium text-mocha px-3 py-1.5 rounded-full border border-brand-soft/50">Retiro gratuito</span>
                <span className="bg-brand-soft text-xs font-medium text-brand-dark px-3 py-1.5 rounded-full">Delivery CABA</span>
              </div>
            </div>

            {/* Contacto */}
            <div className="bg-cream rounded-2xl p-5 border border-brand-soft/30">
              <p className="font-bold text-chocolate mb-3">Contacto directo</p>
              <div className="space-y-2.5">
                {CONTACT.map(({ Icon, label, href }) => (
                  <a
                    key={href}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-3 text-sm text-mocha hover:text-brand transition-colors group"
                  >
                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center border border-brand-soft/50 group-hover:bg-brand-soft transition-colors flex-shrink-0">
                      <Icon size={13} className="text-brand" />
                    </div>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { ShoppingCart, CreditCard, Package, Clock, MapPin } from 'lucide-react'
import { motion, type Variants } from 'framer-motion'

const STEPS = [
  {
    Icon: ShoppingCart,
    title: 'Elegís tu antojo',
    desc: 'Explorá el catálogo, elegí el producto y el tamaño que más te tiente.',
    num: 1,
  },
  {
    Icon: CreditCard,
    title: 'Mandás la seña',
    desc: 'Confirmás el pedido con una seña por Mercado Pago. Rápido y seguro.',
    num: 2,
  },
  {
    Icon: Package,
    title: 'Coordinamos y listo',
    desc: 'Te avisamos cuando está listo. Retirás en Almagro o te lo llevamos a tu casa.',
    num: 3,
  },
]

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export default function OrderSteps() {
  return (
    <section id="como-pedir" className="px-6 py-24" style={{ background: '#F6EAD6' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        {/* Header */}
        <p
          className="text-center font-semibold text-pink-deep"
          style={{ fontSize: '0.82rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}
        >
          Simple y rápido
        </p>
        <h2
          className="text-center font-fraunces font-bold text-brown"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: 56 }}
        >
          Cómo hacer tu pedido
        </h2>

        {/* Steps */}
        <motion.div
          className="flex flex-col md:flex-row justify-between gap-10 relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {/* Dotted connector line (desktop) */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute"
            style={{
              top: 34, left: '15%', right: '15%', height: 1, zIndex: 0,
              background: 'repeating-linear-gradient(to right, #5A3B29 0 6px, transparent 6px 12px)',
              opacity: 0.25,
            }}
          />

          {STEPS.map(({ Icon, title, desc }, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              transition={{ duration: 0.5 }}
              className="flex-1 text-center relative"
              style={{ zIndex: 1 }}
            >
              {/* Icon circle */}
              <motion.div
                className="mx-auto flex items-center justify-center mb-4"
                style={{
                  width: 68, height: 68, borderRadius: '50%',
                  background: '#fff', color: '#E285AF',
                  boxShadow: '0 8px 20px rgba(58,36,23,0.10)',
                }}
                whileHover={{ scale: 1.35 }}
                transition={{ type: 'spring', stiffness: 150, damping: 12 }}
              >
                <Icon size={24} />
              </motion.div>

              <h3
                className="font-fraunces font-semibold text-brown mx-auto"
                style={{ fontSize: '1.15rem', marginBottom: 8 }}
              >
                {title}
              </h3>
              <p
                className="text-brown-soft mx-auto"
                style={{ fontSize: '0.9rem', lineHeight: 1.55, maxWidth: 260 }}
              >
                {desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Note box */}
        <div
          className="bg-white rounded-2xl flex flex-wrap items-center justify-center gap-7 text-sm text-brown-soft"
          style={{
            maxWidth: 860, margin: '56px auto 0',
            padding: '22px 30px',
            boxShadow: '0 8px 24px rgba(58,36,23,0.06)',
            lineHeight: 1.6,
          }}
        >
          <span className="flex items-center gap-2">
            <Clock size={15} style={{ color: '#E285AF', flexShrink: 0 }} />
            <span>
              <strong className="text-brown">Anticipación mínima:</strong> 48 hs
            </span>
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={15} style={{ color: '#E285AF', flexShrink: 0 }} />
            <span>
              <strong className="text-brown">Delivery zona CABA</strong> según barrio · Retiro gratis en Almagro
            </span>
          </span>
        </div>
      </div>
    </section>
  )
}

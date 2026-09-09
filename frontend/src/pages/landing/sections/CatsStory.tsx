import { Cat } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CatsStory() {
  return (
    <section id="nosotros" className="px-6 py-24" style={{ background: '#FDF6EC' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p
              className="font-semibold text-pink-deep"
              style={{ fontSize: '0.82rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}
            >
              Nuestra historia
            </p>
            <h2
              className="font-fraunces font-bold text-brown"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', lineHeight: 1.15, marginBottom: 20 }}
            >
              Un postre para vos,{' '}
              <span style={{ color: '#E285AF' }}>una ayuda para ellos</span>
            </h2>
            <p className="text-brown-soft" style={{ lineHeight: 1.7, marginBottom: 16, fontSize: '0.97rem' }}>
              Román arrancó haciendo cookies en casa porque le apasionaba la pastelería.
              Con el tiempo se dio cuenta que podía hacer algo más grande: cada pedido
              que le hacen ayuda a financiar el cuidado de gatitos en situación de calle.
            </p>
            <p className="text-brown-soft" style={{ lineHeight: 1.7, marginBottom: 28, fontSize: '0.97rem' }}>
              Todo es artesanal, con ingredientes de calidad, y con mucho amor.
              No es solo un postre — es una forma de hacer bien al mundo comiendo rico.
            </p>

            <div
              className="flex items-center gap-4 rounded-2xl"
              style={{ background: '#F6EAD6', padding: '18px 22px' }}
            >
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #F0A0C4, #E285AF)' }}
              >
                <Cat size={22} style={{ color: '#fff' }} />
              </div>
              <div>
                <p className="font-semibold text-brown text-sm">Gatitos ayudados</p>
                <p className="text-brown-soft text-xs" style={{ lineHeight: 1.5 }}>
                  Parte de cada venta va directo a su cuidado y esterilización.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Visual grid */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {[
              { bg: 'linear-gradient(135deg, #F4BDE0, #E285AF)', emoji: '🍪', h: 160, mt: 0 },
              { bg: 'linear-gradient(135deg, #EFE2CB, #F0A0C4)', emoji: '🎂', h: 130, mt: 24 },
              { bg: 'linear-gradient(135deg, #F6EAD6, #EFE2CB)', emoji: '🍫', h: 130, mt: 0 },
              { bg: 'linear-gradient(135deg, #F0A0C4, #F4BDE0)', emoji: '🐱', h: 160, mt: -24 },
            ].map(({ bg, emoji, h, mt }, i) => (
              <div
                key={i}
                className="rounded-2xl flex items-center justify-center"
                style={{ background: bg, height: h, marginTop: mt, fontSize: 40 }}
              >
                {emoji}
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  )
}

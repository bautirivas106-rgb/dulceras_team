import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Cookie, Clock, Package, CreditCard, MapPin, Bell } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const FAQS: { Icon: LucideIcon; question: string; answer: string }[] = [
  {
    Icon: Clock,
    question: '¿Con cuánta anticipación debo hacer mi pedido?',
    answer: 'Para la mayoría de los productos necesitamos al menos 48 horas. Las tortas enteras requieren 72 horas.',
  },
  {
    Icon: Package,
    question: '¿Hacen entregas a domicilio?',
    answer: 'Sí, hacemos delivery en CABA. El costo varía según el barrio y se calcula en el checkout.',
  },
  {
    Icon: Cookie,
    question: '¿Trabajan con pedidos personalizados?',
    answer: 'Sí. Para pedidos especiales consultanos por WhatsApp o Instagram antes de confirmar.',
  },
  {
    Icon: MapPin,
    question: '¿Puedo retirar mi pedido?',
    answer: 'Sí, el retiro es gratuito en Lomas del Mirador, Buenos Aires. Te indicamos el punto de entrega por WhatsApp.',
  },
  {
    Icon: CreditCard,
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos Mercado Pago para la seña (tarjeta, transferencia, QR). El saldo se coordina al momento de la entrega.',
  },
  {
    Icon: Bell,
    question: '¿Cómo sé si mi pedido fue confirmado?',
    answer: 'Al completar el pedido recibís un mensaje por WhatsApp con todos los detalles de confirmación.',
  },
]

function FaqItem({ Icon, question, answer, isOpen, onToggle }: {
  Icon: LucideIcon; question: string; answer: string; isOpen: boolean; onToggle: () => void
}) {
  return (
    <div className="border border-brand-soft/50 rounded-2xl overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-soft flex-shrink-0 flex items-center justify-center">
            <Icon size={15} className="text-brand-dark" strokeWidth={2} />
          </div>
          <span className="font-semibold text-chocolate text-sm">{question}</span>
        </div>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-brand transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-mocha leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const left = FAQS.slice(0, 3)
  const right = FAQS.slice(3, 6)

  return (
    <section id="faq" className="px-6 py-20" style={{ background: '#FDF6EC' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-brand uppercase tracking-widest mb-2">Preguntas frecuentes ♡</p>
          <h2 className="text-3xl md:text-4xl font-bold text-chocolate">Respondemos tus dudas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            {left.map((faq, i) => (
              <FaqItem key={i} {...faq} isOpen={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)} />
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {right.map((faq, i) => (
              <FaqItem key={i + 3} {...faq} isOpen={openIndex === i + 3} onToggle={() => setOpenIndex(openIndex === i + 3 ? null : i + 3)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

import { TestimonialGrid } from "@/components/ui/testimonial"
import type { Testimonial } from "@/components/ui/testimonial"

const REVIEWS: Testimonial[] = [
  {
    name: "Martina González",
    role: "Cliente frecuente",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&h=100&auto=format&fit=crop",
    stars: 5,
    text: "Las cookies de chocolate son increíbles, las mejores que probé en mi vida. Siempre pido la caja x6 y nunca alcanzan.",
  },
  {
    name: "Valentina Ruiz",
    role: "Organizadora de eventos",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&auto=format&fit=crop",
    stars: 5,
    text: "Encargué la torta de chocolate para el cumple de mi nena y fue un éxito total. Presentación hermosa y un sabor que no olvidamos.",
  },
  {
    name: "Sofía Lambruschini",
    role: "Estudiante",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&h=100&auto=format&fit=crop",
    stars: 5,
    text: "Todo riquísimo y la atención de Román siempre un 10. El tiramisú es una locura, cremoso y con el sabor perfecto.",
  },
  {
    name: "Agustina Peralta",
    role: "Mamá de tres",
    avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=100&h=100&auto=format&fit=crop",
    stars: 5,
    text: "Los budines son lo más esponjosos y húmedos que comí. Y encima cada compra ayuda a gatitos, ¡no hay con qué darle!",
  },
  {
    name: "Camila Benitez",
    role: "Diseñadora gráfica",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=100&h=100&auto=format&fit=crop",
    stars: 5,
    text: "Siempre superan mis expectativas. El packaging es divino y los brownies son fudgy de verdad, no secos como en otros lados.",
  },
  {
    name: "Lucrecia Mamani",
    role: "Contadora",
    avatar: "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?q=80&w=100&h=100&auto=format&fit=crop",
    stars: 5,
    text: "Pedí el cheesecake de dulce de leche para una reunión y todos me preguntaron dónde lo había comprado. ¡Un éxito total!",
  },
]

export default function TestimonialSection() {
  return (
    <section id="resenas" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">
            Lo que dicen nuestros clientes ♡
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-chocolate">
            Experiencias que nos llenan de alegría
          </h2>
          <p className="text-mocha mt-3 max-w-md mx-auto">
            Más de 500 clientes felices en Buenos Aires. Esto es lo que nos cuentan.
          </p>
        </div>

        <TestimonialGrid testimonials={REVIEWS} />
      </div>
    </section>
  )
}

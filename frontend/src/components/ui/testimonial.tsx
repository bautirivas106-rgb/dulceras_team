import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

export interface Testimonial {
  name: string
  role: string
  avatar: string
  text: string
  stars: number
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={18}
          strokeWidth={0}
          className={i < count ? "fill-brand" : "fill-gray-200"}
        />
      ))}
    </div>
  )
}

function TestimonialCard({ testimonial, className }: { testimonial: Testimonial; className?: string }) {
  return (
    <div className={cn(
      "text-sm w-80 border border-gray-200 pb-6 rounded-2xl bg-white shadow-[0px_4px_15px_0px] shadow-black/5 overflow-hidden flex-shrink-0",
      className
    )}>
      <div className="flex items-center gap-4 px-5 py-4 bg-brand/10">
        <img
          className="h-12 w-12 rounded-full object-cover object-top"
          src={testimonial.avatar}
          alt={testimonial.name}
        />
        <div>
          <h3 className="text-base font-semibold text-gray-800">{testimonial.name}</h3>
          <p className="text-gray-500 text-xs">{testimonial.role}</p>
        </div>
      </div>
      <div className="p-5 pb-4">
        <StarRating count={testimonial.stars} />
        <p className="text-gray-500 mt-4 leading-relaxed">{testimonial.text}</p>
      </div>
    </div>
  )
}

export function TestimonialGrid({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="flex flex-wrap items-stretch justify-center gap-6">
      {testimonials.map((t, i) => (
        <TestimonialCard key={i} testimonial={t} />
      ))}
    </div>
  )
}

export default TestimonialCard

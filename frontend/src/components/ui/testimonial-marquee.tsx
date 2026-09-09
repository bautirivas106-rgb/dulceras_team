import { Star } from 'lucide-react'
import { Marquee } from './marquee'
import { Card, CardContent } from './card'
import { cn } from '@/lib/utils'
import type { PublicReview } from '@/types/landing'

interface TestimonialMarqueeProps {
  reviews: PublicReview[]
  pauseOnHover?: boolean
  durationSeconds?: number
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'fill-brand text-brand' : 'fill-brand-neutral text-brand-neutral'}
        />
      ))}
    </div>
  )
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-10 h-10 rounded-full object-cover"
      />
    )
  }
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
  return (
    <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center text-brand-dark text-sm font-bold flex-shrink-0">
      {initials}
    </div>
  )
}

function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <Card className="w-72 flex-shrink-0">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={review.customerName} avatarUrl={review.avatarUrl} />
          <div className="min-w-0">
            <p className="font-semibold text-chocolate text-sm truncate">{review.customerName}</p>
            {review.username && (
              <p className="text-xs text-mocha truncate">@{review.username}</p>
            )}
          </div>
        </div>
        {review.rating !== undefined && <StarRating rating={review.rating} />}
        <p className={cn('text-sm text-mocha leading-relaxed', review.comment.length > 120 && 'line-clamp-4')}>
          {review.comment}
        </p>
      </CardContent>
    </Card>
  )
}

export function TestimonialMarquee({
  reviews,
  pauseOnHover = true,
  durationSeconds = 28,
}: TestimonialMarqueeProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 text-mocha text-sm">
        Muy pronto vas a poder conocer las experiencias de nuestra comunidad.
      </div>
    )
  }

  const half = Math.ceil(reviews.length / 2)
  const row1 = reviews.slice(0, half)
  const row2 = reviews.slice(half)

  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      <Marquee pauseOnHover={pauseOnHover} durationSeconds={durationSeconds}>
        {row1.map(r => <ReviewCard key={r.id} review={r} />)}
      </Marquee>
      {row2.length > 0 && (
        <Marquee reverse pauseOnHover={pauseOnHover} durationSeconds={durationSeconds + 4}>
          {row2.map(r => <ReviewCard key={r.id} review={r} />)}
        </Marquee>
      )}
    </div>
  )
}

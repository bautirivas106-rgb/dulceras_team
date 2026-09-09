import { useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MarqueeProps {
  children: React.ReactNode
  reverse?: boolean
  pauseOnHover?: boolean
  className?: string
  durationSeconds?: number
}

export function Marquee({
  children,
  reverse = false,
  pauseOnHover = false,
  className,
  durationSeconds = 30,
}: MarqueeProps) {
  const [paused, setPaused] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return (
      <div className={cn('flex flex-wrap gap-4 justify-center', className)}>
        {children}
      </div>
    )
  }

  return (
    <div
      className={cn('relative flex overflow-hidden w-full', className)}
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
      }}
      onMouseEnter={pauseOnHover ? () => setPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setPaused(false) : undefined}
    >
      <div
        className="flex w-max"
        style={{
          animation: `${reverse ? 'marquee-reverse' : 'marquee'} ${durationSeconds}s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        <div className="flex gap-4 pr-4">{children}</div>
        <div className="flex gap-4 pr-4" aria-hidden="true">{children}</div>
      </div>
    </div>
  )
}

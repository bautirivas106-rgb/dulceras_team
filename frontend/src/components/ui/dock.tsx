import { createContext, useContext, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

const MouseXCtx = createContext<ReturnType<typeof useMotionValue<number>> | null>(null)

export function DockRow({ children, className }: { children: React.ReactNode; className?: string }) {
  const mouseX = useMotionValue(Infinity)
  return (
    <MouseXCtx.Provider value={mouseX}>
      <div
        className={cn('flex items-end gap-2.5', className)}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {children}
      </div>
    </MouseXCtx.Provider>
  )
}

interface DockIconProps {
  label: string
  light?: boolean
  className?: string
  onClick?: () => void
  children: React.ReactNode
}

export function DockIcon({ label, light = false, className, onClick, children }: DockIconProps) {
  const ctxMouseX = useContext(MouseXCtx)
  const ownMouseX = useMotionValue(Infinity)
  const mouseX = ctxMouseX ?? ownMouseX
  const ref = useRef<HTMLDivElement>(null)

  const distance = useTransform(mouseX, (x) => {
    const el = ref.current
    if (!el || x === Infinity) return 1000
    const rect = el.getBoundingClientRect()
    return x - (rect.left + rect.width / 2)
  })

  const scale = useSpring(
    useTransform(distance, [-80, 0, 80], [1, 1.45, 1]),
    { stiffness: 150, damping: 12 }
  )

  return (
    <motion.div ref={ref} style={{ scale, originY: 1 }} className="relative group">
      <span
        className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1',
          'text-[11px] font-medium rounded-md whitespace-nowrap z-10',
          'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0',
          'transition-all duration-150 pointer-events-none',
          light ? 'bg-white/90 text-brown' : 'bg-brown text-cream',
        )}
      >
        {label}
      </span>
      <button
        onClick={onClick}
        aria-label={label}
        className={cn('flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200', className)}
        style={
          light
            ? { background: 'rgba(255,255,255,0.08)', color: '#D8C4AC' }
            : { background: 'rgba(58,36,23,0.05)', color: '#5A3B29' }
        }
        onMouseEnter={e => {
          e.currentTarget.style.background = '#E285AF'
          e.currentTarget.style.color = '#fff'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = light ? 'rgba(255,255,255,0.08)' : 'rgba(58,36,23,0.05)'
          e.currentTarget.style.color = light ? '#D8C4AC' : '#5A3B29'
        }}
      >
        {children}
      </button>
    </motion.div>
  )
}

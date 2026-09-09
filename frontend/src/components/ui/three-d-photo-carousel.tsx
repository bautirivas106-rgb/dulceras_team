import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import type { CarouselProductImage } from '@/types/landing'

const PRODUCT_EMOJIS: Record<string, string> = {
  cookie: '🍪', torta: '🎂', brownie: '🍫', cheesecake: '🍰',
  budín: '🍞', tiramisú: '☕', chipá: '🧀', postre: '🍮',
}

function getEmoji(name = ''): string {
  const lower = name.toLowerCase()
  for (const [key, emoji] of Object.entries(PRODUCT_EMOJIS)) {
    if (lower.includes(key)) return emoji
  }
  return '🍰'
}

function ProductImageCard({
  image,
  large = false,
}: {
  image: CarouselProductImage
  large?: boolean
}) {
  if (image.src) {
    return (
      <img
        src={image.src}
        alt={image.alt}
        loading="lazy"
        className={`w-full h-full object-cover rounded-2xl shadow-xl ${large ? 'rounded-3xl' : ''}`}
      />
    )
  }
  return (
    <div
      className="w-full h-full rounded-2xl flex flex-col items-center justify-center gap-2 shadow-xl"
      style={{ background: 'linear-gradient(135deg, #F4BDE0, #ED58AA22)' }}
    >
      <span className="text-4xl">{getEmoji(image.productName)}</span>
      <span className="text-xs font-semibold text-brand-dark text-center px-2 leading-tight">
        {image.productName ?? image.alt}
      </span>
    </div>
  )
}

interface ThreeDPhotoCarouselProps {
  images: CarouselProductImage[]
  autoRotate?: boolean
  onImageClick?: (image: CarouselProductImage) => void
}

const RADIUS = 260

export function ThreeDPhotoCarousel({
  images,
  autoRotate = true,
  onImageClick,
}: ThreeDPhotoCarouselProps) {
  const rotationRef = useRef(0)
  const [rotation, setRotation] = useState(0)
  const [selected, setSelected] = useState<CarouselProductImage | null>(null)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragStartRot = useRef(0)
  const frameRef = useRef<number>(0)
  const prefersReducedMotion = useReducedMotion()

  const count = images.length
  const angleStep = count > 0 ? 360 / count : 0

  useEffect(() => {
    if (!autoRotate || prefersReducedMotion || selected) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      return
    }
    const tick = () => {
      if (!isDragging.current) {
        rotationRef.current -= 0.12
        setRotation(rotationRef.current)
      }
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [autoRotate, prefersReducedMotion, selected])

  const openModal = useCallback((image: CarouselProductImage) => {
    setSelected(image)
    onImageClick?.(image)
    document.body.style.overflow = 'hidden'
  }, [onImageClick])

  const closeModal = useCallback(() => {
    setSelected(null)
    document.body.style.overflow = ''
  }, [])

  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, closeModal])

  function onPointerDown(e: React.PointerEvent) {
    isDragging.current = true
    dragStartX.current = e.clientX
    dragStartRot.current = rotationRef.current;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging.current) return
    const delta = e.clientX - dragStartX.current
    rotationRef.current = dragStartRot.current + delta * 0.35
    setRotation(rotationRef.current)
  }

  function onPointerUp() {
    isDragging.current = false
  }

  if (images.length === 0) return null

  if (prefersReducedMotion) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory">
        {images.map(img => (
          <button
            key={img.id}
            onClick={() => openModal(img)}
            className="flex-shrink-0 w-44 h-60 snap-center rounded-2xl overflow-hidden"
            aria-label={img.alt}
          >
            <ProductImageCard image={img} />
          </button>
        ))}
      </div>
    )
  }

  return (
    <>
      <div
        style={{ perspective: '1100px' }}
        className="relative h-[360px] md:h-[460px] select-none cursor-grab active:cursor-grabbing overflow-hidden"
        role="region"
        aria-label="Galería de productos. Arrastrá para girar."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotation}deg)`,
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {images.map((img, i) => {
            const angle = i * angleStep
            return (
              <div
                key={img.id}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '168px',
                  height: '224px',
                  transform: `rotateY(${angle}deg) translateZ(${RADIUS}px) translate(-50%, -50%)`,
                  backfaceVisibility: 'hidden',
                  cursor: 'pointer',
                }}
                onClick={() => openModal(img)}
                role="button"
                aria-label={img.alt}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openModal(img) }}
              >
                <ProductImageCard image={img} />
              </div>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={selected.alt}
            onClick={closeModal}
          >
            <button
              onClick={closeModal}
              aria-label="Cerrar imagen"
              className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition-colors"
            >
              <X size={24} />
            </button>
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-72 h-96"
              onClick={e => e.stopPropagation()}
            >
              <ProductImageCard image={selected} large />
              {selected.productName && (
                <p className="text-white text-center mt-3 font-semibold text-lg">{selected.productName}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

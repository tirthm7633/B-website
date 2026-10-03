import { useEffect, useRef } from 'react'
import { useEscapeLayer } from '../../lib/useEscapeLayer'

interface LightboxProps {
  images: string[]
  index: number
  alt: string
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function Lightbox({ images, index, alt, onClose, onNavigate }: LightboxProps) {
  // Escape only closes the topmost overlay, and the previous body overflow is
  // restored (not blanked) so closing this over another locked overlay (e.g.
  // the Brands panel) doesn't unlock the page behind it.
  useEscapeLayer(true, onClose)

  // Horizontal swipe (touch) steps to the next/previous photo, like the arrow keys.
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onNavigate((index + 1) % images.length)
      if (e.key === 'ArrowLeft') onNavigate((index - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, images.length, onNavigate])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} photo viewer`}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-bg/95 backdrop-blur-md"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      onTouchStart={(e) => {
        const t = e.touches[0]
        touchStart.current = { x: t.clientX, y: t.clientY }
      }}
      onTouchEnd={(e) => {
        const start = touchStart.current
        touchStart.current = null
        if (!start || images.length < 2) return
        const t = e.changedTouches[0]
        const dx = t.clientX - start.x
        const dy = t.clientY - start.y
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          onNavigate(dx < 0 ? (index + 1) % images.length : (index - 1 + images.length) % images.length)
        }
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close photo viewer"
        className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center text-text transition-colors duration-300 hover:text-accent-bright"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => onNavigate((index - 1 + images.length) % images.length)}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-text transition-colors duration-300 hover:text-accent-bright md:left-6"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onNavigate((index + 1) % images.length)}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-text transition-colors duration-300 hover:text-accent-bright md:right-6"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </>
      )}

      <img
        src={images[index]}
        alt={`${alt} — photo ${index + 1} of ${images.length}`}
        className="max-h-[85vh] max-w-[90vw] rounded-sm border border-line object-contain"
      />

      <span className="absolute bottom-6 text-[0.65rem] tracking-[0.2em] text-muted uppercase">
        {index + 1} / {images.length}
      </span>
    </div>
  )
}

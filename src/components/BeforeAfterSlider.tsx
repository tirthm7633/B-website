import { useCallback, useEffect, useRef, useState } from 'react'

interface BeforeAfterSliderProps {
  before: string
  after: string
  alt: string
}

/**
 * Two stacked images with a draggable vertical divider revealing the
 * "after" image over the "before" one. Works with mouse drag and touch
 * drag; clicking/tapping anywhere on the frame also jumps the divider
 * there. Position is tracked as a percentage of the frame's own width, so
 * it stays correct across resizes without a listener.
 */
export default function BeforeAfterSlider({ before, after, alt }: BeforeAfterSliderProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const [position, setPosition] = useState(50)

  const setFromClientX = useCallback((clientX: number) => {
    const frame = frameRef.current
    if (!frame) return
    const rect = frame.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.min(100, Math.max(0, pct)))
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return
      setFromClientX(e.clientX)
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current) return
      const touch = e.touches[0]
      if (!touch) return
      setFromClientX(touch.clientX)
    }
    const stopDragging = () => {
      draggingRef.current = false
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', stopDragging)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', stopDragging)
    window.addEventListener('touchcancel', stopDragging)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', stopDragging)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', stopDragging)
      window.removeEventListener('touchcancel', stopDragging)
    }
  }, [setFromClientX])

  const startDragging = () => {
    draggingRef.current = true
  }

  const onFrameClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setFromClientX(e.clientX)
  }

  const nudge = (delta: number) => setPosition((p) => Math.min(100, Math.max(0, p + delta)))

  return (
    <div
      ref={frameRef}
      className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-sm border border-line md:aspect-video"
      onClick={onFrameClick}
    >
      <img src={before} alt={`${alt} — before`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <img src={after} alt={`${alt} — after`} loading="lazy" className="h-full w-full object-cover" draggable={false} />
      </div>

      <span className="pointer-events-none absolute bottom-3 left-3 text-[0.6rem] font-bold tracking-[0.2em] text-muted uppercase">
        Before
      </span>
      <span className="pointer-events-none absolute bottom-3 right-3 text-[0.6rem] font-bold tracking-[0.2em] text-accent-bright uppercase">
        After
      </span>

      <div className="absolute inset-y-0 w-px bg-accent-bright" style={{ left: `${position}%` }} aria-hidden="true" />

      <div
        role="slider"
        tabIndex={0}
        aria-label={`Reveal ${alt} before and after, ${Math.round(position)} percent`}
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="absolute top-1/2 flex h-9 w-9 -translate-y-1/2 -translate-x-1/2 cursor-ew-resize items-center justify-center rounded-full border border-accent-bright bg-bg/90 shadow-[0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-sm"
        style={{ left: `${position}%` }}
        onMouseDown={(e) => {
          e.stopPropagation()
          startDragging()
        }}
        onTouchStart={(e) => {
          e.stopPropagation()
          startDragging()
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') nudge(-5)
          if (e.key === 'ArrowRight') nudge(5)
        }}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 8 4 12l4 4M16 8l4 4-4 4" />
        </svg>
      </div>
    </div>
  )
}

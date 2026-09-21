import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { brands } from '../data/content'
import { BRAND_PLATE_HEIGHT } from '../lib/brandPlateSize'
import { prefersReducedMotion } from '../lib/usePrefersReducedMotion'
import BrandLogo from './BrandLogo'

interface BrandsPanelProps {
  open: boolean
  onClose: () => void
}

export default function BrandsPanel({ open, onClose }: BrandsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  // Open/close animation — slow, quiet fade + slight slide.
  useEffect(() => {
    const panel = panelRef.current
    const content = contentRef.current
    if (!panel || !content) return

    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
      gsap.set(panel, { display: 'flex' })
      if (prefersReducedMotion()) {
        gsap.set([panel, content], { opacity: 1, y: 0 })
      } else {
        gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out' })
        gsap.fromTo(content, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.1 })
      }
      closeBtnRef.current?.focus()
    } else {
      document.body.style.overflow = ''
      previouslyFocused.current?.focus()
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleClose = () => {
    const panel = panelRef.current
    if (!panel) return
    if (prefersReducedMotion()) {
      gsap.set(panel, { display: 'none' })
      onClose()
      return
    }
    gsap.to(panel, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        gsap.set(panel, { display: 'none' })
        onClose()
      },
    })
  }

  // Escape to close, and a simple focus trap while open.
  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
        return
      }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="All brands"
      className="fixed inset-0 z-[60] hidden flex-col overflow-y-auto bg-bg/97 backdrop-blur-md"
      style={{ opacity: 0 }}
      onMouseDown={(e) => {
        // Close on any click that isn't on a brand card or the close button
        // — nested wrapper/gap divs would otherwise absorb the click before
        // it ever reaches this element, so checking target===currentTarget
        // alone misses clicks in the grid's padding and gaps.
        const target = e.target as HTMLElement
        if (!target.closest('[data-brand-card], button')) handleClose()
      }}
    >
      <div className="flex items-center justify-between px-6 pt-6 md:px-12 md:pt-10">
        <span className="eyebrow">All Brands</span>
        <button
          ref={closeBtnRef}
          type="button"
          onClick={handleClose}
          aria-label="Close brands panel"
          className="flex h-10 w-10 items-center justify-center text-text transition-colors duration-300 hover:text-accent-bright"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div ref={contentRef} className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-10 md:px-12">
        <div className="flex flex-wrap justify-center gap-6">
          {brands.map((brand) => (
            <div
              key={brand.name}
              data-brand-card
              className="flex w-[calc(50%-12px)] flex-col items-center gap-3 md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]"
            >
              <BrandLogo
                src={brand.logo}
                alt={`${brand.name} logo`}
                fallbackLabel={brand.name}
                plate={brand.plate}
                className={`${BRAND_PLATE_HEIGHT} w-full`}
              />
              <div className="flex flex-wrap justify-center gap-1.5">
                {brand.categories.map((cat) => (
                  <span key={cat} className="text-[0.55rem] tracking-[0.15em] text-muted uppercase">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

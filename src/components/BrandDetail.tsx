import gsap from 'gsap'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { brandGallery } from '../data/brandGallery'
import type { Brand } from '../data/content'
import { useEscapeLayer } from '../lib/useEscapeLayer'
import { prefersReducedMotion } from '../lib/usePrefersReducedMotion'
import BrandLogo from './BrandLogo'
import Lightbox from './projects/Lightbox'

interface BrandDetailProps {
  brand: Brand
  onClose: () => void
}

/**
 * Full-screen overlay for one brand: logo, name, category tag and its photo
 * gallery. Grid tiles load the small `preview` lazily at their real aspect
 * ratio (so nothing shifts as they arrive); clicking one opens the shared
 * Lightbox on the `full` image. A brand with no photos yet shows a "Photos
 * coming soon" state instead of an empty gallery.
 *
 * Mounted only while a brand is selected. It restores whatever body overflow
 * it found, so opening it over the Brands panel (which already locks scroll)
 * doesn't unlock the page behind when it closes.
 */
export default function BrandDetail({ brand, onClose }: BrandDetailProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const closingRef = useRef(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const photos = brandGallery[brand.name] ?? []

  // Scroll lock, focus handling and the fade/slide-in. Layout effect so the
  // starting (transparent) frame is set before the first paint — no flash.
  useLayoutEffect(() => {
    const root = rootRef.current
    const content = contentRef.current
    if (!root || !content) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    if (!prefersReducedMotion()) {
      gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' })
      gsap.fromTo(content, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.08 })
    }
    closeBtnRef.current?.focus()

    return () => {
      gsap.killTweensOf([root, content])
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [])

  const handleClose = () => {
    if (closingRef.current) return
    closingRef.current = true
    const root = rootRef.current
    if (!root || prefersReducedMotion()) {
      onClose()
      return
    }
    gsap.to(root, { opacity: 0, duration: 0.35, ease: 'power2.in', onComplete: onClose })
  }

  useEscapeLayer(true, handleClose)

  // Keep Tab inside the overlay while it (not the photo viewer) has focus.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const root = rootRef.current
      if (!root || !root.contains(document.activeElement)) return
      const focusable = root.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')
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
  }, [])

  return (
    <>
      <div
        ref={rootRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${brand.name} brand details`}
        // Lenis (global smooth scroll) would otherwise swallow wheel events
        // and stop this overlay scrolling when its gallery is taller than the screen.
        data-lenis-prevent
        className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-bg/97 backdrop-blur-md"
        onMouseDown={(e) => {
          // Anything outside the content column (side margins, space below it) closes.
          const target = e.target as HTMLElement
          if (!target.closest('[data-detail-content], button')) handleClose()
        }}
      >
        <div className="flex items-center justify-between px-6 pt-6 md:px-12 md:pt-10">
          <span className="eyebrow">Brand</span>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleClose}
            aria-label={`Close ${brand.name} details`}
            className="flex h-10 w-10 items-center justify-center text-text transition-colors duration-300 hover:text-accent-bright"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div ref={contentRef} data-detail-content className="mx-auto w-full max-w-5xl px-6 pb-16 pt-8 md:px-12 md:pb-20 md:pt-10">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-8">
            <BrandLogo
              src={brand.logo}
              alt={`${brand.name} logo`}
              fallbackLabel={brand.name}
              plate={brand.plate}
              className="h-24 w-48 shrink-0 md:h-28 md:w-56"
            />
            <div>
              <h2 className="font-display text-4xl text-text md:text-5xl">{brand.name}</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                <li className="rounded-full border border-line px-3 py-1 text-[0.6rem] tracking-[0.18em] text-muted uppercase">
                  {brand.category}
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-line pt-10 md:mt-12 md:pt-12">
            <div role="heading" aria-level={3} className="eyebrow mb-6">
              Photos
            </div>

            {photos.length > 0 ? (
              <div className="columns-2 gap-3 md:columns-3 md:gap-4">
                {photos.map((photo, i) => (
                  <button
                    key={photo.full}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    aria-label={`Enlarge photo ${i + 1} of ${photos.length}: ${photo.alt}`}
                    className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-sm border border-line md:mb-4"
                    style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
                  >
                    <img
                      src={photo.preview}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-line px-6 text-center">
                <span className="eyebrow">Photos coming soon</span>
                <p className="max-w-sm text-sm text-muted">
                  We&rsquo;re adding photography for {brand.name}. Please check back soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={photos.map((photo) => photo.full)}
          index={lightboxIndex}
          alt={brand.name}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  )
}

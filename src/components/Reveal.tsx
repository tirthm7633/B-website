import { useEffect, useRef, type ReactNode } from 'react'
import { prefersReducedMotion } from '../lib/usePrefersReducedMotion'

/**
 * Fades its children up (opacity 0 → 1, 12px → 0, ~550ms ease-out — see `.reveal` in
 * index.css) the first time they scroll into view. Uses an IntersectionObserver and
 * toggles the class straight on the element, so there are no re-renders. With reduced
 * motion (or no IntersectionObserver) the content is simply shown.
 *
 * Don't wrap `position: fixed` overlays in this: while it animates the wrapper has a
 * transform, which would become their containing block.
 */
export default function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible')
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.classList.add('is-visible')
        observer.disconnect()
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  )
}

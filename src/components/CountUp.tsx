import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/usePrefersReducedMotion'

const DURATION_S = 1.8

const canAnimate = () => !prefersReducedMotion() && typeof IntersectionObserver !== 'undefined'

/**
 * A number that counts up from 0 to `value` once it scrolls into view (1.8s, ease-out, starts
 * when its top passes ~85% of the viewport height). Used by the About and Why Us stats.
 *
 * Every instance owns its own observer and tween, and the number it shows is React state, so
 * it can't drift out of sync with the DOM: if React ever re-creates one (a hot reload, a
 * changed key or element type) that instance simply starts its own count. The previous
 * approach, a section-level hook that queried `.stat-value` nodes once and wrote to them with
 * `textContent`, left a freshly mounted number stuck at "0" with nothing attached to it, which
 * is how the Why Us "18+" ended up as "0+" while its neighbours were fine.
 *
 * With reduced motion (or no IntersectionObserver) it renders the final number straight away.
 * The visible digits are aria-hidden and the final number is repeated for screen readers, so
 * they never announce the in-between values.
 */
export default function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const done = useRef(false)
  // How far along the count is, 0 to 1 (already eased). Starts at 1 whenever no count will play,
  // so the real number is what's on the page unless an animation is genuinely about to run.
  const [progress, setProgress] = useState(() => (canAnimate() ? 0 : 1))

  useEffect(() => {
    const el = ref.current
    if (!el || done.current || !canAnimate()) return

    let tween: gsap.core.Tween | undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const counter = { p: 0 }
        tween = gsap.to(counter, {
          p: 1,
          duration: DURATION_S,
          ease: 'power2.out',
          onUpdate: () => setProgress(counter.p),
          onComplete: () => {
            done.current = true
            setProgress(1)
          },
        })
      },
      { rootMargin: '0px 0px -15% 0px' },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      tween?.kill()
    }
  }, [])

  return (
    <span ref={ref} className={className} data-value={value}>
      <span aria-hidden="true">{Math.floor(value * progress)}</span>
      <span className="sr-only">{value}</span>
    </span>
  )
}

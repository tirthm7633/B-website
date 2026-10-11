import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/usePrefersReducedMotion'

const DURATION_S = 1.8

const canAnimate = () => !prefersReducedMotion() && typeof IntersectionObserver !== 'undefined'

/**
 * A stat number (with its prefix/suffix, e.g. "10+") that counts up from 0 once it scrolls into
 * view (1.8s, ease-out, starting when its top passes ~85% of the viewport height). Used by the
 * About and Why Us stats; `count={false}` shows it static (e.g. a year).
 *
 * The real, final number is what's on the page by default — it only drops to 0 just before the
 * counter comes into view (and goes back to final if you scroll away before the count starts) —
 * so a slow script, a missed observer or reduced motion can never leave a stat reading "0".
 *
 * Each number is in the page once: the animated digits are aria-hidden and the whole value is the
 * counter's accessible name, so screen readers hear "10+" once and never the in-between values.
 * (role="img" because aria-label on a plain span is ignored by most screen readers.)
 *
 * Every instance owns its own observers and tween, and the number it shows is React state, so it
 * can't drift out of sync with the DOM (an earlier section-level version that wrote textContent
 * left a re-mounted Why Us "18+" stuck at "0+").
 */
export default function CountUp({
  value,
  prefix = '',
  suffix = '',
  count = true,
  className,
}: {
  value: number
  prefix?: string
  suffix?: string
  count?: boolean
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const done = useRef(false)
  // How far along the count is, 0 to 1 (already eased). 1 = the final number.
  const [progress, setProgress] = useState(1)

  useEffect(() => {
    const el = ref.current
    if (!el || !count || done.current || !canAnimate()) return

    let tween: gsap.core.Tween | undefined
    // Starts the count once the top passes ~85% of the viewport.
    const start = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || tween) return
        start.disconnect()
        arm.disconnect()
        const counter = { p: 0 }
        setProgress(0)
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
    // Drops to 0 while still below the fold (so the reset is never seen), back to final if the
    // visitor scrolls away again before the count starts.
    const arm = new IntersectionObserver(([entry]) => {
      if (!tween) setProgress(entry.isIntersecting ? 0 : 1)
    }, { rootMargin: '0px 0px 30% 0px' })
    arm.observe(el)
    start.observe(el)
    return () => {
      start.disconnect()
      arm.disconnect()
      tween?.kill()
    }
  }, [count])

  // Counted figures get thousands separators (15,000); static ones, like a year, print as written.
  const format = (n: number) => (count ? n.toLocaleString('en-IN') : String(n))
  const label = `${prefix}${format(value)}${suffix}`
  return (
    <span ref={ref} className={className} role="img" aria-label={label} data-value={value}>
      <span aria-hidden="true">
        {prefix}
        {format(Math.floor(value * progress))}
        {suffix}
      </span>
    </span>
  )
}
